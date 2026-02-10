'use client';

import type { Language } from '@/src/domain/entities/Language';
import { SUPPORTED_LANGUAGES, getLanguageLabel } from '@/src/domain/entities/Language';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LanguageSelectorProps {
  label: string;
  value: Language;
  onChange: (value: Language) => void;
  displayLanguage?: Language;
}

export function LanguageSelector({
  label,
  value,
  onChange,
  displayLanguage = 'en',
}: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">{label}</span>
      <Select value={value} onValueChange={(v) => onChange(v as Language)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {getLanguageLabel(lang, displayLanguage)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
