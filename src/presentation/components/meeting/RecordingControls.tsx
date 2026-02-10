'use client';

import { useState } from 'react';
import type { MeetingStatus } from '@/src/domain/entities/Meeting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  if (status === 'completed') {
    return (
      <div className="flex flex-wrap items-center gap-3 p-4">
        <Badge variant="secondary">Recording completed</Badge>
        {duration && <span className="text-sm text-muted-foreground">{duration}</span>}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 p-4">
        {status === 'idle' && (
          <>
            <Button onClick={onStart} size="lg" className="gap-2">
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
            {onSaveAndLeave && (
              <Button onClick={onSaveAndLeave} variant="secondary" size="lg" className="gap-2">
                <Save className="h-4 w-4" />
                Save & Leave
              </Button>
            )}
          </>
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
            <Button onClick={() => setShowStopConfirm(true)} variant="destructive" size="lg" className="gap-2">
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
            <Button onClick={() => setShowStopConfirm(true)} variant="destructive" size="lg" className="gap-2">
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

      <AlertDialog open={showStopConfirm} onOpenChange={setShowStopConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>미팅을 종료하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              종료하면 녹음이 완료되며 더 이상 녹음할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={onStop}>종료</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
