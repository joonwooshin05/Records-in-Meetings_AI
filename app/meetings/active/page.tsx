'use client';

import { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RecordingControls } from '@/src/presentation/components/meeting/RecordingControls';
import { TranscriptPanel } from '@/src/presentation/components/meeting/TranscriptPanel';
import { TranslationPanel } from '@/src/presentation/components/meeting/TranslationPanel';
import { SummaryPanel } from '@/src/presentation/components/meeting/SummaryPanel';
import { LanguageSelector } from '@/src/presentation/components/meeting/LanguageSelector';
import { MeetingCodeDisplay } from '@/src/presentation/components/meeting/MeetingCodeDisplay';
import { ParticipantList } from '@/src/presentation/components/meeting/ParticipantList';
import { useTranscription } from '@/src/presentation/hooks/useTranscription';
import { useTranslation } from '@/src/presentation/hooks/useTranslation';
import { useSummary } from '@/src/presentation/hooks/useSummary';
import { useRealtimeMeeting } from '@/src/presentation/hooks/useRealtimeMeeting';
import { useDependencies } from '@/src/presentation/providers/DependencyProvider';
import { useAuth } from '@/src/presentation/providers/AuthProvider';
import { useI18n } from '@/src/presentation/providers/I18nProvider';
import type { Language } from '@/src/domain/entities/Language';
import type { Meeting } from '@/src/domain/entities/Meeting';
import type { Transcript } from '@/src/domain/entities/Transcript';
import { ArrowLeft, Loader2, Radio } from 'lucide-react';

export default function ActiveMeetingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ActiveMeetingContent />
    </Suspense>
  );
}

function ActiveMeetingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const meetingId = searchParams.get('id');
  const meetingCode = searchParams.get('code');
  const role = searchParams.get('role'); // 'host' | 'participant'
  const isParticipant = role === 'participant';

  const { meetingService } = useDependencies();
  const { user } = useAuth();
  const { t } = useI18n();

  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [sourceLang, setSourceLang] = useState<Language>('en');
  const [targetLang, setTargetLang] = useState<Language>('ko');

  const {
    meeting: realtimeMeeting,
    participants,
    remoteTranscripts,
    pushTranscript,
    updateStatus,
    reconnect,
  } = useRealtimeMeeting();

  const { meeting, transcripts, isRecording, error, startRecording, stopRecording, pauseRecording, saveAndLeave, loadTranscripts } =
    useTranscription({
      onTranscriptReady: meetingCode
        ? (transcript) => {
            pushTranscript(transcript);
          }
        : undefined,
      speakerInfo: user
        ? {
            speakerId: user.id,
            speakerName: user.displayName ?? user.email,
            speakerPhotoURL: user.photoURL ?? undefined,
          }
        : undefined,
    });

  const { translations, isTranslating, translateBatch, clearTranslations } = useTranslation();
  const {
    summary,
    isGenerating,
    error: summaryError,
    generateSummary,
  } = useSummary();

  // Merge local + remote transcripts, deduplicate by id
  const displayTranscripts = useMemo(() => {
    if (!meetingCode) return transcripts;
    const merged = new Map<string, Transcript>();
    for (const t of remoteTranscripts) merged.set(t.id, t);
    for (const t of transcripts) merged.set(t.id, t);
    return Array.from(merged.values()).sort((a, b) => a.timestamp - b.timestamp);
  }, [meetingCode, remoteTranscripts, transcripts]);

  // Re-subscribe to Firestore when page loads with a meeting code
  useEffect(() => {
    if (meetingCode && role) {
      reconnect(meetingCode, role as 'host' | 'participant');
    }
  }, [meetingCode, role, reconnect]);

  useEffect(() => {
    async function loadMeeting() {
      if (meetingId) {
        const m = await meetingService.getMeeting(meetingId);
        if (m) {
          setActiveMeeting(m);
          setSourceLang(m.sourceLanguage);
          setTargetLang(m.targetLanguage);
          if (m.transcripts.length > 0) {
            loadTranscripts([...m.transcripts]);
          }
        }
      } else if (isParticipant && realtimeMeeting) {
        setActiveMeeting(realtimeMeeting);
        setSourceLang(realtimeMeeting.sourceLanguage);
        setTargetLang(realtimeMeeting.targetLanguage);
      }
      setLoading(false);
    }
    loadMeeting();
  }, [meetingId, meetingService, isParticipant, realtimeMeeting, loadTranscripts]);

  // Auto-translate new final transcripts
  useEffect(() => {
    if (displayTranscripts.length > 0 && sourceLang !== targetLang) {
      translateBatch(displayTranscripts, targetLang);
    }
  }, [displayTranscripts, targetLang, sourceLang, translateBatch]);

  const handleStart = useCallback(async () => {
    const meetingToUse = activeMeeting ?? realtimeMeeting;
    if (meetingToUse) {
      startRecording(meetingToUse, sourceLang);
      if (meetingCode && !isParticipant) {
        await updateStatus('recording');
      }
    }
  }, [activeMeeting, realtimeMeeting, sourceLang, startRecording, meetingCode, updateStatus, isParticipant]);

  const handleStop = useCallback(async () => {
    const completed = await stopRecording();
    if (completed) {
      setActiveMeeting(completed);
    }
    if (meetingCode && !isParticipant) {
      await updateStatus('completed');
    }
  }, [stopRecording, meetingCode, updateStatus, isParticipant]);

  const handlePause = useCallback(() => {
    pauseRecording();
    if (meetingCode && !isParticipant) {
      updateStatus('paused');
    }
  }, [pauseRecording, meetingCode, updateStatus, isParticipant]);

  const handleSaveAndLeave = useCallback(async () => {
    await saveAndLeave();
    if (meetingCode) {
      await updateStatus('paused');
    }
    router.push('/');
  }, [saveAndLeave, meetingCode, updateStatus, router]);

  const handleGenerateSummary = useCallback(() => {
    const id = meetingId ?? activeMeeting?.id;
    if (id) {
      const finalTranscripts = displayTranscripts.filter((t) => t.isFinal);
      generateSummary(finalTranscripts, sourceLang, id);
    }
  }, [meetingId, activeMeeting, displayTranscripts, sourceLang, generateSummary]);

  const meetingStatus = realtimeMeeting?.status ?? meeting?.status ?? activeMeeting?.status ?? 'idle';
  // Participant's own recording status is independent from host meeting status
  const currentStatus = isParticipant
    ? (isRecording ? 'recording' : (transcripts.length > 0 ? 'paused' : 'idle'))
    : meetingStatus;

  const formatDuration = () => {
    if (displayTranscripts.length === 0) return '00:00';
    const maxTs = Math.max(...displayTranscripts.map((t) => t.timestamp));
    const seconds = Math.floor(maxTs / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-4 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">{activeMeeting?.title ?? realtimeMeeting?.title ?? 'Meeting'}</h1>
          {meetingCode && <MeetingCodeDisplay code={meetingCode} />}
          <ParticipantList participants={participants} />
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector label={t('meeting.sourceLang')} value={sourceLang} onChange={setSourceLang} />
          <span className="text-muted-foreground">→</span>
          <LanguageSelector
            label={t('meeting.targetLang')}
            value={targetLang}
            onChange={(v) => {
              setTargetLang(v);
              clearTranslations();
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md px-4 py-2 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Host recording status indicator for participants */}
      {isParticipant && meetingStatus === 'recording' && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 rounded-md px-4 py-2 mb-4 text-sm text-red-600 dark:text-red-400">
          <Radio className="h-4 w-4 animate-pulse" />
          {t('realtime.hostRecording')}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        {/* Desktop layout */}
        <div className="hidden md:flex md:flex-col md:gap-4 h-full">
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <div className="border rounded-lg flex flex-col">
              <div className="px-4 py-2 border-b font-medium text-sm">{t('meeting.transcript')}</div>
              <div className="flex-1 min-h-0">
                <TranscriptPanel transcripts={displayTranscripts} emptyMessage={t('meeting.noTranscripts')} />
              </div>
            </div>
            <div className="border rounded-lg flex flex-col">
              <div className="px-4 py-2 border-b font-medium text-sm">{t('meeting.translation')}</div>
              <div className="flex-1 min-h-0">
                <TranslationPanel
                  transcripts={displayTranscripts}
                  translations={translations}
                  isTranslating={isTranslating}
                />
              </div>
            </div>
          </div>
          {(summary || isGenerating) && (
            <div className="border rounded-lg max-h-64 overflow-y-auto shrink-0">
              <SummaryPanel
                summary={summary}
                isGenerating={isGenerating}
                onGenerate={handleGenerateSummary}
                error={summaryError}
                canGenerate={displayTranscripts.filter((t) => t.isFinal).length > 0}
              />
            </div>
          )}
        </div>

        {/* Mobile layout */}
        <div className="md:hidden h-full">
          <Tabs defaultValue="transcript" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transcript">{t('meeting.transcript')}</TabsTrigger>
              <TabsTrigger value="translation">{t('meeting.translation')}</TabsTrigger>
              <TabsTrigger value="summary">{t('meeting.summary')}</TabsTrigger>
            </TabsList>
            <TabsContent value="transcript" className="flex-1 min-h-0 border rounded-lg">
              <TranscriptPanel transcripts={displayTranscripts} emptyMessage={t('meeting.noTranscripts')} />
            </TabsContent>
            <TabsContent value="translation" className="flex-1 min-h-0 border rounded-lg">
              <TranslationPanel
                transcripts={displayTranscripts}
                translations={translations}
                isTranslating={isTranslating}
              />
            </TabsContent>
            <TabsContent value="summary" className="flex-1 min-h-0 border rounded-lg">
              <SummaryPanel
                summary={summary}
                isGenerating={isGenerating}
                onGenerate={handleGenerateSummary}
                error={summaryError}
                canGenerate={displayTranscripts.filter((t) => t.isFinal).length > 0}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Separator className="my-3" />

      {/* Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <RecordingControls
            status={currentStatus}
            onStart={handleStart}
            onStop={handleStop}
            onPause={handlePause}
            onSaveAndLeave={isParticipant ? undefined : handleSaveAndLeave}
            duration={formatDuration()}
          />
        </div>
        {displayTranscripts.filter((t) => t.isFinal).length > 0 && (
          <div className="flex justify-end">
            <Button
              onClick={handleGenerateSummary}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? t('meeting.generating') : t('meeting.generateSummary')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
