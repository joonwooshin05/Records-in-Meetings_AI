import type { Language } from '@/src/domain/entities/Language';
import en from './locales/en.json';
import ko from './locales/ko.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';

const locales: Record<Language, typeof en> = { en, ko, ja, zh };

type NestedKeyOf<T, P extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: NestedKeyOf<T[K], P extends '' ? K : `${P}.${K}`>;
    }[keyof T & string]
  : P;

export type TranslationKey = NestedKeyOf<typeof en>;

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? path;
}

export function translate(key: string, locale: Language): string {
  return getNestedValue(locales[locale], key);
}

export { locales };
