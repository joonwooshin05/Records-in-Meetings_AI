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

  // Use refs for tracking to avoid dependency cycles
  const processedRef = useRef<Set<string>>(new Set());

  const translateBatch = useCallback(
    (transcripts: Transcript[], targetLanguage: Language) => {
      const toTranslate = transcripts.filter(
        (t) => t.isFinal && !processedRef.current.has(t.id) && t.language !== targetLanguage
      );

      if (toTranslate.length === 0) return;

      setIsTranslating(true);
      let remaining = toTranslate.length;

      for (const transcript of toTranslate) {
        processedRef.current.add(transcript.id);

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
            remaining--;
            if (remaining === 0) {
              setIsTranslating(false);
            }
          });
      }
    },
    [translationPort]
  );

  const retryFailed = useCallback(
    (transcripts: Transcript[], targetLanguage: Language) => {
      // Remove failed IDs from processed so they can be retried
      for (const [id] of errors) {
        processedRef.current.delete(id);
      }
      setErrors(new Map());
      translateBatch(transcripts, targetLanguage);
    },
    [translateBatch, errors]
  );

  const clearTranslations = useCallback(() => {
    processedRef.current.clear();
    setTranslations(new Map());
    setErrors(new Map());
  }, []);

  const failedIds = new Set(errors.keys());

  return { translations, isTranslating, failedIds, errors, translateBatch, retryFailed, clearTranslations };
}
