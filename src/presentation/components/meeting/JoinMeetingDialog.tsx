'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { LanguageSelector } from './LanguageSelector';
import { useI18n } from '@/src/presentation/providers/I18nProvider';
import type { Language } from '@/src/domain/entities/Language';
import { Loader2 } from 'lucide-react';

interface JoinMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin: (code: string, targetLanguage: Language) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function JoinMeetingDialog({
  open,
  onOpenChange,
  onJoin,
  loading,
  error,
}: JoinMeetingDialogProps) {
  const { t } = useI18n();
  const [code, setCode] = useState('');
  const [targetLang, setTargetLang] = useState<Language>('ko');

  const formatCode = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length > 3) {
      return `${clean.slice(0, 3)}-${clean.slice(3, 6)}`;
    }
    return clean;
  };

  const handleSubmit = async () => {
    if (code.replace('-', '').length !== 6) return;
    await onJoin(code, targetLang);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('realtime.joinMeeting')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md px-4 py-2 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t('realtime.meetingCode')}
            </label>
            <Input
              placeholder="ABC-123"
              value={code}
              onChange={(e) => setCode(formatCode(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="font-mono text-center text-lg tracking-widest"
              maxLength={7}
              autoFocus
            />
          </div>
          <LanguageSelector
            label={t('meeting.targetLang')}
            value={targetLang}
            onChange={setTargetLang}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={code.replace('-', '').length !== 6 || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t('realtime.joining')}
              </>
            ) : (
              t('realtime.joinMeeting')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
