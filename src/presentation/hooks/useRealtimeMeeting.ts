'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Meeting } from '@/src/domain/entities/Meeting';
import type { Transcript } from '@/src/domain/entities/Transcript';
import type { Participant } from '@/src/domain/entities/Participant';
import type { Language } from '@/src/domain/entities/Language';
import { useDependencies } from '@/src/presentation/providers/DependencyProvider';
import { useAuth } from '@/src/presentation/providers/AuthProvider';

export function useRealtimeMeeting() {
  const { realtimeMeetingService } = useDependencies();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [remoteTranscripts, setRemoteTranscripts] = useState<Transcript[]>([]);
  const [meetingCode, setMeetingCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribesRef = useRef<(() => void)[]>([]);

  const cleanup = useCallback(() => {
    unsubscribesRef.current.forEach((unsub) => unsub());
    unsubscribesRef.current = [];
  }, []);

  const subscribe = useCallback(
    (code: string) => {
      cleanup();

      const unsubTranscripts = realtimeMeetingService.subscribeToTranscripts(
        code,
        (transcripts) => {
          setRemoteTranscripts(transcripts);
        }
      );

      const unsubParticipants = realtimeMeetingService.subscribeToParticipants(
        code,
        (parts) => {
          setParticipants(parts);
        }
      );

      const unsubStatus = realtimeMeetingService.subscribeToMeetingStatus(code, (mtg) => {
        setMeeting(mtg);
      });

      unsubscribesRef.current = [unsubTranscripts, unsubParticipants, unsubStatus];
    },
    [realtimeMeetingService, cleanup]
  );

  useEffect(() => cleanup, [cleanup]);

  const createRoom = useCallback(
    async (title: string, sourceLang: Language, targetLang: Language) => {
      if (!user) throw new Error('Must be authenticated');
      setLoading(true);
      setError(null);
      try {
        const mtg = await realtimeMeetingService.createRealtimeMeeting(
          title,
          sourceLang,
          targetLang,
          user.id,
          user.displayName ?? user.email
        );
        setMeeting(mtg);
        setMeetingCode(mtg.meetingCode!);
        setIsHost(true);
        subscribe(mtg.meetingCode!);
        return mtg;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to create room');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [user, realtimeMeetingService, subscribe]
  );

  const joinRoom = useCallback(
    async (code: string, targetLanguage: Language) => {
      if (!user) throw new Error('Must be authenticated');
      setLoading(true);
      setError(null);
      try {
        const mtg = await realtimeMeetingService.joinMeeting(
          code.toUpperCase(),
          user.id,
          user.displayName ?? user.email,
          targetLanguage
        );
        if (!mtg) {
          setError('Meeting not found');
          return null;
        }
        setMeeting(mtg);
        setMeetingCode(code.toUpperCase());
        setIsHost(false);
        subscribe(code.toUpperCase());
        return mtg;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to join room');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, realtimeMeetingService, subscribe]
  );

  const leaveRoom = useCallback(async () => {
    if (!meetingCode || !user) return;
    cleanup();
    await realtimeMeetingService.leaveMeeting(meetingCode, user.id);
    setMeeting(null);
    setMeetingCode(null);
    setParticipants([]);
    setRemoteTranscripts([]);
  }, [meetingCode, user, realtimeMeetingService, cleanup]);

  const pushTranscript = useCallback(
    async (transcript: Transcript) => {
      if (!meetingCode) return;
      await realtimeMeetingService.syncTranscript(meetingCode, transcript);
    },
    [meetingCode, realtimeMeetingService]
  );

  const updateStatus = useCallback(
    async (status: string) => {
      if (!meetingCode) return;
      await realtimeMeetingService.updateStatus(meetingCode, status);
    },
    [meetingCode, realtimeMeetingService]
  );

  const reconnect = useCallback(
    (code: string, role: 'host' | 'participant') => {
      setMeetingCode(code);
      setIsHost(role === 'host');
      subscribe(code);
    },
    [subscribe]
  );

  return {
    meeting,
    participants,
    remoteTranscripts,
    meetingCode,
    isHost,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    pushTranscript,
    updateStatus,
    reconnect,
  };
}
