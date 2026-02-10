'use client';

import { useEffect, useRef } from 'react';
import type { Transcript } from '@/src/domain/entities/Transcript';
import type { Translation } from '@/src/domain/entities/Translation';
import type { Language } from '@/src/domain/entities/Language';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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

  const hasFailures = failedIds && failedIds.size > 0;
  let lastSession: number | undefined;

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {finalTranscripts.map((transcript, i) => {
          const translation = translations.get(transcript.id);
          const errorMsg = errors?.get(transcript.id);
          const isSameLanguage = transcript.language === targetLanguage;
          const showDivider = i > 0 && transcript.session !== undefined && transcript.session !== lastSession;
          lastSession = transcript.session;
          return (
            <div key={transcript.id}>
              {showDivider && (
                <div className="flex items-center gap-2 my-2">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Session {(transcript.session ?? 0) + 1}
                  </span>
                  <Separator className="flex-1" />
                </div>
              )}
              <div className="flex gap-3">
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
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
