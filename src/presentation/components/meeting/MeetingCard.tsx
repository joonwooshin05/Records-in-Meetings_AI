'use client';

import type { Meeting } from '@/src/domain/entities/Meeting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface MeetingCardProps {
  meeting: Meeting;
  onClick?: () => void;
  onDelete?: () => void;
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  idle: 'outline',
  recording: 'destructive',
  paused: 'secondary',
  completed: 'default',
};

export function MeetingCard({ meeting, onClick, onDelete }: MeetingCardProps) {
  return (
    <Card
      role="article"
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{meeting.title}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[meeting.status]}>
            {meeting.status}
          </Badge>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{meeting.createdAt.toLocaleDateString()}</span>
          <span>{meeting.transcriptCount} transcripts</span>
          {meeting.summary && <Badge variant="outline">Summary available</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
