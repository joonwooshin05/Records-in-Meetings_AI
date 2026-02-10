'use client';

import { useState, useCallback, useRef } from 'react';
import type { Translation } from '@/src/domain/entities/Translation';
import type { Transcript } from '@/src/domain/entities/Transcript';
import type { Language } from '@/src/domain/entities/Language';
import { useDependencies } from '@/src/presentation/providers/DependencyProvider';

export function useTranslation() {
  const { translationPort } = useDependencies();
  const [translations, setTranslations] = useState<Map<string, Translation>>(new Map());
  const [isTranslating, setIsTranslating] = useState(false);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const pendingRef = useRef<Set<string>>(new Set());

  const translateOne = useCallback(
    (transcript: Transcript, targetLanguage: Language) => {
      if (pendingRef.current.has(transcript.id)) return;
      pendingRef.current.add(transcript.id);
      setIsTranslating(true);

      // Remove from errors if retrying
      setErrors((prev) => {
        if (!prev.has(transcript.id)) return prev;
        const next = new Map(prev);
        next.delete(transcript.id);
        return next;
      });

      translationPort
        .translate(transcript.text, transcript.language, targetLanguage, transcript.id)
        .then((translation) => {
          setTranslations((prev) => {
            const next = new Map(prev);
            next.set(transcript.id, translation);
            return next;
          });
        })
        .catch((err) => {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[Translation] Failed for "${transcript.text.slice(0, 30)}":`, msg);
          setErrors((prev) => {
            const next = new Map(prev);
            next.set(transcript.id, msg);
            return next;
          });
        })
        .finally(() => {
          pendingRef.current.delete(transcript.id);
          if (pendingRef.current.size === 0) {
            setIsTranslating(false);
          }
        });
    },
    [translationPort]
  );

  const sameLanguageIdsRef = useRef<Set<string>>(new Set());

  const translateBatch = useCallback(
    (transcripts: Transcript[], targetLanguage: Language) => {
      const toTranslate = transcripts.filter(
        (t) =>
          t.isFinal &&
          !translations.has(t.id) &&
          !pendingRef.current.has(t.id) &&
          !errors.has(t.id) &&
          !sameLanguageIdsRef.current.has(t.id)
      );

      for (const t of toTranslate) {
        if (t.language === targetLanguage) {
          // Same language — no translation needed, mark as skipped
          sameLanguageIdsRef.current.add(t.id);
          continue;
        }
        translateOne(t, targetLanguage);
      }
    },
    [translateOne, translations, errors]
  );

  const retryFailed = useCallback(
    (transcripts: Transcript[], targetLanguage: Language) => {
      const failed = transcripts.filter((t) => errors.has(t.id));
      setErrors(new Map());
      for (const t of failed) {
        translateOne(t, targetLanguage);
      }
    },
    [translateOne, errors]
  );

  const clearTranslations = useCallback(() => {
    pendingRef.current.clear();
    sameLanguageIdsRef.current.clear();
    setTranslations(new Map());
    setErrors(new Map());
  }, []);

  // Build failedIds set for backward compatibility
  const failedIds = new Set(errors.keys());

  return { translations, isTranslating, failedIds, errors, sameLanguageIds: sameLanguageIdsRef.current, translateBatch, retryFailed, clearTranslations };
}
