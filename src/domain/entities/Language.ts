export const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja', 'zh'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export function isValidLanguage(value: string): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language);
}

const LANGUAGE_LABELS: Record<Language, Record<Language, string>> = {
  ko: { ko: '한국어', en: 'Korean', ja: '韓国語', zh: '韩语' },
  en: { ko: '영어', en: 'English', ja: '英語', zh: '英语' },
  ja: { ko: '일본어', en: 'Japanese', ja: '日本語', zh: '日语' },
  zh: { ko: '중국어', en: 'Chinese', ja: '中国語', zh: '中文' },
};

export function getLanguageLabel(lang: Language, displayLang: Language): string {
  return LANGUAGE_LABELS[lang][displayLang];
}
