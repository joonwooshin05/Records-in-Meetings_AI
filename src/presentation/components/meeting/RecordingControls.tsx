'use client';

import type { MeetingStatus } from '@/src/domain/entities/Meeting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, Square, Pause, Play, Save } from 'lucide-react';

interface RecordingControlsProps {
  status: MeetingStatus;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onSaveAndLeave?: () => void;
  duration?: string;
}

export function RecordingControls({
  status,
  onStart,
  onStop,
  onPause,
  onSaveAndLeave,
  duration,
}: RecordingControlsProps) {
  if (status === 'completed') {
    return (
      <div className="flex items-center gap-3 p-4">
        <Badge variant="secondary">Recording completed</Badge>
        {duration && <span className="text-sm text-muted-foreground">{duration}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4">
      {status === 'idle' && (
        <Button onClick={onStart} size="lg" className="gap-2">
          <Mic className="h-4 w-4" />
          Start Recording
        </Button>
      )}

      {status === 'recording' && (
        <>
          <Badge variant="destructive" className="animate-pulse">
            Recording
          </Badge>
          <Button onClick={onPause} variant="outline" size="lg" className="gap-2">
            <Pause className="h-4 w-4" />
            Pause
          </Button>
          <Button onClick={onStop} variant="destructive" size="lg" className="gap-2">
            <Square className="h-4 w-4" />
            Stop
          </Button>
          {onSaveAndLeave && (
            <Button onClick={onSaveAndLeave} variant="secondary" size="lg" className="gap-2">
              <Save className="h-4 w-4" />
              Save & Leave
            </Button>
          )}
        </>
      )}

      {status === 'paused' && (
        <>
          <Badge variant="outline">Paused</Badge>
          <Button onClick={onStart} size="lg" className="gap-2">
            <Play className="h-4 w-4" />
            Resume
          </Button>
          <Button onClick={onStop} variant="destructive" size="lg" className="gap-2">
            <Square className="h-4 w-4" />
            Stop
          </Button>
          {onSaveAndLeave && (
            <Button onClick={onSaveAndLeave} variant="secondary" size="lg" className="gap-2">
              <Save className="h-4 w-4" />
              Save & Leave
            </Button>
          )}
        </>
      )}

      {duration && <span className="text-sm text-muted-foreground ml-auto">{duration}</span>}
    </div>
  );
}
