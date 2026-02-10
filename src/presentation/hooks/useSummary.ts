'use client';

import { useState, useCallback } from 'react';
import type { Summary } from '@/src/domain/entities/Summary';
import type { Transcript } from '@/src/domain/entities/Transcript';
import type { Language } from '@/src/domain/entities/Language';
import { useDependencies } from '@/src/presentation/providers/DependencyProvider';

export function useSummary() {
  const { summarizationPort } = useDependencies();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = useCallback(
    async (transcripts: Transcript[], language: Language, meetingId: string) => {
      if (transcripts.filter((t) => t.isFinal).length === 0) {
        setError('No transcripts to summarize.');
        return null;
      }

      try {
        setIsGenerating(true);
        setError(null);
        const result = await summarizationPort.summarize(transcripts, language, meetingId);
        setSummary(result);
        return result;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to generate summary');
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [summarizationPort]
  );

  return { summary, setSummary, isGenerating, error, generateSummary };
}
