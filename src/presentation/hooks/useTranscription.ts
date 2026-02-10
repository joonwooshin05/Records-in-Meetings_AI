'use client';

import { useState, useCallback, useRef } from 'react';
import type { Meeting } from '@/src/domain/entities/Meeting';
import { Transcript } from '@/src/domain/entities/Transcript';
import type { Language } from '@/src/domain/entities/Language';
import { useDependencies } from '@/src/presentation/providers/DependencyProvider';
import type { WebSpeechRecognitionAdapter } from '@/src/infrastructure/adapters/WebSpeechRecognitionAdapter';

interface SpeakerInfo {
  speakerId: string;
  speakerName: string;
  speakerPhotoURL?: string;
}

interface UseTranscriptionOptions {
  onTranscriptReady?: (transcript: Transcript) => void;
  speakerInfo?: SpeakerInfo;
}

export function useTranscription(options?: UseTranscriptionOptions) {
  const { speechRecognition, meetingService } = useDependencies();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const meetingRef = useRef<Meeting | null>(null);
  const sessionRef = useRef(0);

  const startRecording = useCallback(
    async (activeMeeting: Meeting, language: Language) => {
      try {
        if (!speechRecognition.isSupported()) {
          setError('Speech recognition is not supported in this browser.');
          return;
        }

        const recordingMeeting = activeMeeting.start();
        setMeeting(recordingMeeting);
        meetingRef.current = recordingMeeting;

        if (activeMeeting.status === 'idle') {
          setTranscripts([]);
          sessionRef.current = 0;
          // Reset timer for fresh recording
          if ('resetTimer' in speechRecognition) {
            (speechRecognition as WebSpeechRecognitionAdapter).resetTimer();
          }
        } else {
          // Resuming from pause — increment session
          sessionRef.current++;
        }

        setIsRecording(true);
        setError(null);

        const currentSession = sessionRef.current;

        speechRecognition.onResult((rawTranscript: Transcript) => {
          const transcript = new Transcript({
            id: rawTranscript.id,
            text: rawTranscript.text,
            timestamp: rawTranscript.timestamp,
            language: rawTranscript.language,
            isFinal: rawTranscript.isFinal,
            speaker: options?.speakerInfo?.speakerName,
            speakerId: options?.speakerInfo?.speakerId,
            speakerPhotoURL: options?.speakerInfo?.speakerPhotoURL,
            session: currentSession,
          });

          if (transcript.isFinal) {
            setTranscripts((prev) => [...prev, transcript]);
            meetingRef.current = meetingRef.current?.addTranscript(transcript) ?? null;
            options?.onTranscriptReady?.(transcript);
          } else {
            setTranscripts((prev) => {
              const withoutInterim = prev.filter((t) => t.isFinal);
              return [...withoutInterim, transcript];
            });
          }
        });

        speechRecognition.onError((err: Error) => {
          setError(err.message);
        });

        speechRecognition.onEnd(() => {
          // Auto-restart for continuous recording
          if (meetingRef.current?.status === 'recording') {
            try {
              speechRecognition.start(language);
            } catch {
              // recognition may have already stopped
            }
          }
        });

        speechRecognition.start(language);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to start recording');
      }
    },
    [speechRecognition, options?.onTranscriptReady]
  );

  const stopRecording = useCallback(async () => {
    speechRecognition.stop();
    setIsRecording(false);
    if (meetingRef.current) {
      const completed = meetingRef.current.complete();
      setMeeting(completed);
      meetingRef.current = completed;
      await meetingService.saveMeeting(completed);
      return completed;
    }
    return null;
  }, [speechRecognition, meetingService]);

  const pauseRecording = useCallback(() => {
    speechRecognition.stop();
    setIsRecording(false);
    if (meetingRef.current && meetingRef.current.status === 'recording') {
      const paused = meetingRef.current.pause();
      setMeeting(paused);
      meetingRef.current = paused;
    }
  }, [speechRecognition]);

  const loadTranscripts = useCallback((saved: Transcript[]) => {
    setTranscripts(saved);
    // Set session counter from loaded data
    const maxSession = saved.reduce((max, t) => Math.max(max, t.session ?? 0), 0);
    sessionRef.current = maxSession;
  }, []);

  const saveAndLeave = useCallback(async () => {
    speechRecognition.stop();
    setIsRecording(false);
    if (meetingRef.current) {
      let toSave = meetingRef.current;
      if (toSave.status === 'recording') {
        toSave = toSave.pause();
      }
      setMeeting(toSave);
      meetingRef.current = toSave;
      await meetingService.saveMeeting(toSave);
      return toSave;
    }
    return null;
  }, [speechRecognition, meetingService]);

  return {
    meeting,
    transcripts,
    isRecording,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    saveAndLeave,
    loadTranscripts,
  };
}
