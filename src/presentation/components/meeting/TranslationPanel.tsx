'use client';

import { useEffect, useRef, useMemo } from 'react';
import type { Transcript } from '@/src/domain/entities/Transcript';
import type { Translation } from '@/src/domain/entities/Translation';
import type { Language } from '@/src/domain/entities/Language';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface TranslationPanelProps {
  transcripts: Transcript[];
  translations: Map<string, Translation>;
  isTranslating: boolean;
  targetLanguage: Language;
  failedIds?: Set<string>;
  errors?: Map<string, string>;
  onRetry?: () => void;
  emptyMessage?: string;
}

function formatTimestamp(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function TranslationPanel({
  transcripts,
  translations,
  isTranslating,
  targetLanguage,
  failedIds,
  errors,
  onRetry,
  emptyMessage,
}: TranslationPanelProps) {
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, translations]);

  const finalTranscripts = transcripts.filter((t) => t.isFinal);
  const reversedTranscripts = useMemo(() => [...finalTranscripts].reverse(), [finalTranscripts]);

  if (finalTranscripts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-8">
        <p>{emptyMessage ?? 'Translations will appear here.'}</p>
      </div>
    );
  }

  const hasFailures = failedIds && failedIds.size > 0;

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        <div ref={topRef} />
        {reversedTranscripts.map((transcript) => {
          const translation = translations.get(transcript.id);
          const errorMsg = errors?.get(transcript.id);
          const isSameLanguage = transcript.language === targetLanguage;
          return (
            <div key={transcript.id} className="flex gap-3">
              <span className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                {formatTimestamp(transcript.timestamp)}
              </span>
              <div className="flex-1">
                {translation ? (
                  <p className="text-sm leading-relaxed">{translation.translatedText}</p>
                ) : isSameLanguage ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">{transcript.text}</p>
                ) : errorMsg ? (
                  <p className="text-sm text-destructive italic">
                    Error: {errorMsg}
                  </p>
                ) : failedIds?.has(transcript.id) ? (
                  <p className="text-sm text-destructive italic">Translation failed</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {isTranslating ? 'Translating...' : 'Waiting for translation...'}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {hasFailures && onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="gap-2 mt-2">
            <RefreshCw className="h-3 w-3" />
            Retry failed translations
          </Button>
        )}
        {isTranslating && (
          <Badge variant="outline" className="text-xs">
            Translating...
          </Badge>
        )}
      </div>
    </ScrollArea>
  );
}
