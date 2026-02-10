'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Language } from '@/src/domain/entities/Language';

const SETTINGS_KEY = 'meeting-ai-settings';

export interface AppSettings {
  sourceLanguage: Language;
  targetLanguage: Language;
  uiLanguage: Language;
}

const DEFAULT_SETTINGS: AppSettings = {
  sourceLanguage: 'en',
  targetLanguage: 'ko',
  uiLanguage: 'en',
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      }
    } catch {
      // ignore
    }
  }, []);

  const updateSettings = useCallback((update: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...update };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
