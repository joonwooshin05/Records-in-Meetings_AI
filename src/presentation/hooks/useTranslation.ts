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
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const pendingRef = useRef<Set<string>>(new Set());

  const translateBatch = useCallback(
    (transcripts: Transcript[], targetLanguage: Language) => {
      const toTranslate = transcripts.filter(
        (t) =>
          t.isFinal &&
          !translations.has(t.id) &&
          !pendingRef.current.has(t.id) &&
          !failedIds.has(t.id)
      );

      if (toTranslate.length === 0) return;

      setIsTranslating(true);

      for (const transcript of toTranslate) {
        pendingRef.current.add(transcript.id);

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
            console.error(`[Translation] Failed for "${transcript.text.slice(0, 30)}":`, err);
            setFailedIds((prev) => new Set(prev).add(transcript.id));
          })
          .finally(() => {
            pendingRef.current.delete(transcript.id);
            if (pendingRef.current.size === 0) {
              setIsTranslating(false);
            }
          });
      }
    },
    [translationPort, translations, failedIds]
  );

  const clearTranslations = useCallback(() => {
    pendingRef.current.clear();
    setTranslations(new Map());
    setFailedIds(new Set());
  }, []);

  return { translations, isTranslating, failedIds, translateBatch, clearTranslations };
}
