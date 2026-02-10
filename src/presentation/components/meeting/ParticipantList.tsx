'use client';

import type { Participant } from '@/src/domain/entities/Participant';
import { Crown, Users } from 'lucide-react';

interface ParticipantListProps {
  participants: Participant[];
}

export function ParticipantList({ participants }: ParticipantListProps) {
  if (participants.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <div className="flex -space-x-2">
        {participants.map((p) => (
          <div
            key={p.userId}
            className="relative h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium border-2 border-background"
            title={`${p.displayName}${p.isHost ? ' (Host)' : ''}`}
          >
            {p.displayName.charAt(0).toUpperCase()}
            {p.isHost && (
              <Crown className="absolute -top-1.5 -right-1 h-3 w-3 text-yellow-500" />
            )}
          </div>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{participants.length}</span>
    </div>
  );
}
