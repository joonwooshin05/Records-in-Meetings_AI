'use client';

import { useEffect, useRef } from 'react';
import type { Transcript } from '@/src/domain/entities/Transcript';
import type { Translation } from '@/src/domain/entities/Translation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface TranslationPanelProps {
  transcripts: Transcript[];
  translations: Map<string, Translation>;
  isTranslating: boolean;
  failedIds?: Set<string>;
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
  failedIds,
  emptyMessage,
}: TranslationPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, translations]);

  const finalTranscripts = transcripts.filter((t) => t.isFinal);

  if (finalTranscripts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-8">
        <p>{emptyMessage ?? 'Translations will appear here.'}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {finalTranscripts.map((transcript) => {
          const translation = translations.get(transcript.id);
          return (
            <div key={transcript.id} className="flex gap-3">
              <span className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                {formatTimestamp(transcript.timestamp)}
              </span>
              <div className="flex-1">
                {translation ? (
                  <p className="text-sm leading-relaxed">{translation.translatedText}</p>
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
        {isTranslating && (
          <Badge variant="outline" className="text-xs">
            Translating...
          </Badge>
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
