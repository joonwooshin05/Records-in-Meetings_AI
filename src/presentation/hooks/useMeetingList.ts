'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Meeting } from '@/src/domain/entities/Meeting';
import type { Language } from '@/src/domain/entities/Language';
import { useDependencies } from '@/src/presentation/providers/DependencyProvider';
import { useAuth } from '@/src/presentation/providers/AuthProvider';

export function useMeetingList() {
  const { meetingService } = useDependencies();
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const list = user
        ? await meetingService.listMeetingsByUser(user.id)
        : await meetingService.listMeetings();
      setMeetings(list);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  }, [meetingService, user]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const createMeeting = useCallback(
    async (title: string, sourceLang: Language, targetLang: Language) => {
      const meeting = await meetingService.createMeeting(title, sourceLang, targetLang, user?.id);
      await loadMeetings();
      return meeting;
    },
    [meetingService, loadMeetings, user]
  );

  const deleteMeeting = useCallback(
    async (id: string) => {
      await meetingService.deleteMeeting(id);
      await loadMeetings();
    },
    [meetingService, loadMeetings]
  );

  return { meetings, loading, error, createMeeting, deleteMeeting, refreshMeetings: loadMeetings };
}
