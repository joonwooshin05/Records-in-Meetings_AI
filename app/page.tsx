'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { MeetingList } from '@/src/presentation/components/meeting/MeetingList';
import { LanguageSelector } from '@/src/presentation/components/meeting/LanguageSelector';
import { JoinMeetingDialog } from '@/src/presentation/components/meeting/JoinMeetingDialog';
import { useMeetingList } from '@/src/presentation/hooks/useMeetingList';
import { useRealtimeMeeting } from '@/src/presentation/hooks/useRealtimeMeeting';
import { useSettings } from '@/src/presentation/hooks/useSettings';
import { useI18n } from '@/src/presentation/providers/I18nProvider';
import type { Language } from '@/src/domain/entities/Language';
import { Plus, Users, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { meetings, loading, deleteMeeting } = useMeetingList();
  const { createRoom, joinRoom, loading: realtimeLoading, error: realtimeError } = useRealtimeMeeting();
  const { settings } = useSettings();
  const { t } = useI18n();
  const [showDialog, setShowDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [sourceLang, setSourceLang] = useState<Language>(settings.sourceLanguage);
  const [targetLang, setTargetLang] = useState<Language>(settings.targetLanguage);

  const handleCreate = async () => {
    if (!title.trim()) return;
    const meeting = await createRoom(title.trim(), sourceLang, targetLang);
    setShowDialog(false);
    setTitle('');
    router.push(`/meetings/active?id=${meeting.id}&code=${meeting.meetingCode}&role=host`);
  };

  const handleJoin = async (code: string, targetLanguage: Language) => {
    const meeting = await joinRoom(code, targetLanguage);
    if (meeting) {
      setShowJoinDialog(false);
      router.push(`/meetings/active?code=${code.toUpperCase()}&role=participant`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowJoinDialog(true)} className="gap-2">
            <Users className="h-4 w-4" />
            {t('realtime.joinMeeting')}
          </Button>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('dashboard.newMeeting')}
          </Button>
        </div>
      </div>

      <MeetingList
        meetings={meetings}
        onSelect={(meeting) => {
          if (meeting.status === 'completed') {
            router.push(`/meetings/${meeting.id}`);
          } else if (meeting.meetingCode) {
            router.push(`/meetings/active?id=${meeting.id}&code=${meeting.meetingCode}&role=host`);
          } else {
            router.push(`/meetings/active?id=${meeting.id}`);
          }
        }}
        onDelete={deleteMeeting}
        emptyMessage={t('dashboard.noMeetings')}
      />

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dashboard.newMeeting')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('meeting.meetingTitle')}
              </label>
              <Input
                placeholder={t('meeting.enterTitle')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-3">
              <LanguageSelector
                label={t('meeting.sourceLang')}
                value={sourceLang}
                onChange={setSourceLang}
              />
              <LanguageSelector
                label={t('meeting.targetLang')}
                value={targetLang}
                onChange={setTargetLang}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={!title.trim()}>
              {t('meeting.start')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <JoinMeetingDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        onJoin={handleJoin}
        loading={realtimeLoading}
        error={realtimeError}
      />
    </div>
  );
}
