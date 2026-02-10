'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TranscriptPanel } from '@/src/presentation/components/meeting/TranscriptPanel';
import { SummaryPanel } from '@/src/presentation/components/meeting/SummaryPanel';
import { Badge } from '@/components/ui/badge';
import { useDependencies } from '@/src/presentation/providers/DependencyProvider';
import { useSummary } from '@/src/presentation/hooks/useSummary';
import { useI18n } from '@/src/presentation/providers/I18nProvider';
import type { Meeting } from '@/src/domain/entities/Meeting';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { meetingService } = useDependencies();
  const { t } = useI18n();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const { summary, setSummary, isGenerating, error: summaryError, generateSummary } = useSummary();

  useEffect(() => {
    async function loadMeeting() {
      const m = await meetingService.getMeeting(id);
      if (m) {
        setMeeting(m);
        if (m.summary) {
          setSummary(m.summary);
        }
      }
      setLoading(false);
    }
    loadMeeting();
  }, [id, meetingService, setSummary]);

  const handleGenerateSummary = useCallback(async () => {
    if (!meeting) return;
    const finalTranscripts = [...meeting.transcripts].filter((t) => t.isFinal);
    const result = await generateSummary(finalTranscripts, meeting.sourceLanguage, meeting.id);
    if (result) {
      const updated = meeting.setSummary(result);
      await meetingService.saveMeeting(updated);
      setMeeting(updated);
    }
  }, [meeting, generateSummary, meetingService]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="text-muted-foreground">Meeting not found</p>
        <Button variant="outline" onClick={() => router.push('/')} className="mt-4">
          {t('common.back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{meeting.title}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>{meeting.createdAt.toLocaleDateString()}</span>
              <Badge variant="secondary">{meeting.status}</Badge>
              <span>{meeting.transcriptCount} transcripts</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="transcript" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transcript">{t('meeting.transcript')}</TabsTrigger>
          <TabsTrigger value="summary">{t('meeting.summary')}</TabsTrigger>
        </TabsList>
        <TabsContent value="transcript" className="min-h-[400px] border rounded-lg">
          <TranscriptPanel
            transcripts={[...meeting.transcripts]}
            emptyMessage={t('meeting.noTranscripts')}
          />
        </TabsContent>
        <TabsContent value="summary" className="min-h-[400px] border rounded-lg">
          <SummaryPanel
            summary={summary}
            isGenerating={isGenerating}
            onGenerate={handleGenerateSummary}
            error={summaryError}
            canGenerate={meeting.transcriptCount > 0}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
