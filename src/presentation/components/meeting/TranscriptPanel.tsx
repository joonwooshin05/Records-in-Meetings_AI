'use client';

import { useEffect, useRef } from 'react';
import type { Transcript } from '@/src/domain/entities/Transcript';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface TranscriptPanelProps {
  transcripts: Transcript[];
  emptyMessage?: string;
}

function formatTimestamp(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function TranscriptPanel({ transcripts, emptyMessage }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  if (transcripts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-8">
        <p>{emptyMessage ?? 'No transcripts yet.'}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {transcripts.map((transcript, idx) => (
          <div
            key={transcript.isFinal ? transcript.id : `interim-${idx}`}
            className={`flex gap-3 ${!transcript.isFinal ? 'opacity-50' : ''}`}
          >
            <span className="text-xs text-muted-foreground whitespace-nowrap pt-1">
              {formatTimestamp(transcript.timestamp)}
            </span>
            <div className="flex-1">
              <p className="text-sm leading-relaxed">{transcript.text}</p>
              {!transcript.isFinal && (
                <Badge variant="outline" className="text-xs mt-1">
                  listening...
                </Badge>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
