'use client';

import type { Meeting } from '@/src/domain/entities/Meeting';
import { MeetingCard } from './MeetingCard';

interface MeetingListProps {
  meetings: Meeting[];
  onSelect: (meeting: Meeting) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

export function MeetingList({ meetings, onSelect, onDelete, emptyMessage }: MeetingListProps) {
  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-lg">{emptyMessage ?? 'No meetings yet.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {meetings.map((meeting) => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          onClick={() => onSelect(meeting)}
          onDelete={() => onDelete(meeting.id)}
        />
      ))}
    </div>
  );
}
