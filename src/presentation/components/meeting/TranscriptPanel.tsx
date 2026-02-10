'use client';

import { useEffect, useRef } from 'react';
import type { Transcript } from '@/src/domain/entities/Transcript';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface TranscriptGroup {
  speakerId?: string;
  speaker?: string;
  speakerPhotoURL?: string;
  session?: number;
  transcripts: Transcript[];
}

function groupBySpeaker(transcripts: Transcript[]): TranscriptGroup[] {
  const groups: TranscriptGroup[] = [];
  for (const t of transcripts) {
    const lastGroup = groups[groups.length - 1];
    if (
      lastGroup &&
      lastGroup.speakerId === t.speakerId &&
      lastGroup.session === t.session &&
      t.isFinal
    ) {
      lastGroup.transcripts.push(t);
    } else {
      groups.push({
        speakerId: t.speakerId,
        speaker: t.speaker,
        speakerPhotoURL: t.speakerPhotoURL,
        session: t.session,
        transcripts: [t],
      });
    }
  }
  return groups;
}

function SpeakerAvatar({ name, photoURL }: { name?: string; photoURL?: string }) {
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name ?? 'Speaker'}
        className="h-8 w-8 rounded-full shrink-0 object-cover"
      />
    );
  }
  return (
    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">
      {name ? getInitials(name) : '?'}
    </div>
  );
}

export function TranscriptPanel({ transcripts, emptyMessage }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  const groups = groupBySpeaker(transcripts);

  if (transcripts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-8">
        <p>{emptyMessage ?? 'No transcripts yet.'}</p>
      </div>
    );
  }

  let lastSession: number | undefined;

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        {groups.map((group, gi) => {
          const showDivider = gi > 0 && group.session !== undefined && group.session !== lastSession;
          lastSession = group.session;
          return (
            <div key={`group-${gi}`}>
              {showDivider && (
                <div className="flex items-center gap-2 my-3">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Session {(group.session ?? 0) + 1}
                  </span>
                  <Separator className="flex-1" />
                </div>
              )}
              <div className="flex gap-3">
                <SpeakerAvatar name={group.speaker} photoURL={group.speakerPhotoURL} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    {group.speaker && (
                      <span className="text-sm font-medium">{group.speaker}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(group.transcripts[0].timestamp)}
                    </span>
                  </div>
                  {group.transcripts.map((transcript, idx) => (
                    <div
                      key={transcript.isFinal ? transcript.id : `interim-${idx}`}
                      className={!transcript.isFinal ? 'opacity-50' : ''}
                    >
                      <p className="text-sm leading-relaxed">{transcript.text}</p>
                      {!transcript.isFinal && (
                        <Badge variant="outline" className="text-xs mt-1">
                          listening...
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
