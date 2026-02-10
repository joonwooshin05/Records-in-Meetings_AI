'use client';

import { useState, useCallback, useRef } from 'react';
import type { Translation } from '@/src/domain/entities/Translation';
import type { Transcript } from '@/src/domain/entities/Transcript';
import type { Language } from '@/src/domain/entities/Language';
import { useDependencies } from '@/src/presentation/providers/DependencyProvider';

const DELAY_MS = 1000;
const MAX_RETRIES = 3;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useTranslation() {
  const { translationPort } = useDependencies();
  const [translations, setTranslations] = useState<Map<string, Translation>>(new Map());
  const [isTranslating, setIsTranslating] = useState(false);
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const processingRef = useRef(false);
  const queueRef = useRef<{ transcript: Transcript; targetLanguage: Language }[]>([]);
  const translatedIdsRef = useRef<Set<string>>(new Set());

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsTranslating(true);

    while (queueRef.current.length > 0) {
      const item = queueRef.current.shift()!;
      const { transcript, targetLanguage } = item;

      // Skip if already translated while queued
      if (translatedIdsRef.current.has(transcript.id)) continue;

      let success = false;
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          if (attempt > 0) await delay(DELAY_MS * attempt);

          const translation = await translationPort.translate(
            transcript.text,
            transcript.language,
            targetLanguage,
            transcript.id
          );

          translatedIdsRef.current.add(transcript.id);
          setTranslations((prev) => {
            const next = new Map(prev);
            next.set(transcript.id, translation);
            return next;
          });
          setFailedIds((prev) => {
            if (!prev.has(transcript.id)) return prev;
            const next = new Set(prev);
            next.delete(transcript.id);
            return next;
          });
          success = true;
          break;
        } catch (err) {
          console.error(`[Translation] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed for "${transcript.text.slice(0, 30)}":`, err);
        }
      }

      if (!success) {
        setFailedIds((prev) => new Set(prev).add(transcript.id));
      }

      // Small delay between requests to avoid rate limits
      if (queueRef.current.length > 0) {
        await delay(DELAY_MS);
      }
    }

    processingRef.current = false;
    setIsTranslating(false);
  }, [translationPort]);

  const translateBatch = useCallback(
    (transcripts: Transcript[], targetLanguage: Language) => {
      const toTranslate = transcripts.filter(
        (t) =>
          t.isFinal &&
          !translatedIdsRef.current.has(t.id) &&
          !queueRef.current.some((q) => q.transcript.id === t.id)
      );

      if (toTranslate.length === 0) return;

      for (const t of toTranslate) {
        queueRef.current.push({ transcript: t, targetLanguage });
      }

      processQueue();
    },
    [processQueue]
  );

  const clearTranslations = useCallback(() => {
    queueRef.current = [];
    translatedIdsRef.current.clear();
    setTranslations(new Map());
    setFailedIds(new Set());
  }, []);

  return { translations, isTranslating, failedIds, translateBatch, clearTranslations };
}
