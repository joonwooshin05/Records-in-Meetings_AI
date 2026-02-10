'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { LanguageSelector } from '@/src/presentation/components/meeting/LanguageSelector';
import { useSettings } from '@/src/presentation/hooks/useSettings';
import { useI18n } from '@/src/presentation/providers/I18nProvider';
import type { Language } from '@/src/domain/entities/Language';
import { ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const { t, setLocale } = useI18n();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleClearData = async () => {
    const { indexedDB } = window;
    indexedDB.deleteDatabase('meeting-ai-db');
    localStorage.removeItem('meeting-ai-settings');
    setShowClearDialog(false);
    router.push('/');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('settings.languageDefaults')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LanguageSelector
              label={t('settings.defaultSourceLang')}
              value={settings.sourceLanguage}
              onChange={(v) => updateSettings({ sourceLanguage: v })}
            />
            <LanguageSelector
              label={t('settings.defaultTargetLang')}
              value={settings.targetLanguage}
              onChange={(v) => updateSettings({ targetLanguage: v })}
            />
            <Separator />
            <LanguageSelector
              label={t('settings.uiLanguage')}
              value={settings.uiLanguage}
              onChange={(v: Language) => {
                updateSettings({ uiLanguage: v });
                setLocale(v);
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-destructive">{t('settings.clearData')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => setShowClearDialog(true)}>
              {t('settings.clearData')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('settings.clearData')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('settings.clearConfirm')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleClearData}>
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
