import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_LANGUAGES,
  isValidLanguage,
  getLanguageLabel,
  type Language,
} from '@/src/domain/entities/Language';

describe('Language', () => {
  it('should define exactly 4 supported languages', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(4);
    expect(SUPPORTED_LANGUAGES).toContain('ko');
    expect(SUPPORTED_LANGUAGES).toContain('en');
    expect(SUPPORTED_LANGUAGES).toContain('ja');
    expect(SUPPORTED_LANGUAGES).toContain('zh');
  });

  it('should validate a supported language', () => {
    expect(isValidLanguage('ko')).toBe(true);
    expect(isValidLanguage('en')).toBe(true);
    expect(isValidLanguage('ja')).toBe(true);
    expect(isValidLanguage('zh')).toBe(true);
  });

  it('should reject an unsupported language', () => {
    expect(isValidLanguage('fr')).toBe(false);
    expect(isValidLanguage('')).toBe(false);
    expect(isValidLanguage('korean')).toBe(false);
  });

  it('should return correct language label', () => {
    expect(getLanguageLabel('ko', 'ko')).toBe('한국어');
    expect(getLanguageLabel('ko', 'en')).toBe('Korean');
    expect(getLanguageLabel('en', 'ko')).toBe('영어');
    expect(getLanguageLabel('en', 'en')).toBe('English');
    expect(getLanguageLabel('ja', 'ja')).toBe('日本語');
    expect(getLanguageLabel('zh', 'zh')).toBe('中文');
  });
});
