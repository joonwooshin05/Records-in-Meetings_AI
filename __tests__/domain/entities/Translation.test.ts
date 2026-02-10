import { describe, it, expect } from 'vitest';
import { Translation } from '@/src/domain/entities/Translation';

describe('Translation', () => {
  it('should create a valid translation', () => {
    const t = new Translation({
      id: 'tl-1',
      sourceText: 'Hello',
      translatedText: '안녕하세요',
      sourceLanguage: 'en',
      targetLanguage: 'ko',
      transcriptId: 'tr-1',
      createdAt: new Date('2026-01-01'),
    });
    expect(t.id).toBe('tl-1');
    expect(t.sourceText).toBe('Hello');
    expect(t.translatedText).toBe('안녕하세요');
    expect(t.sourceLanguage).toBe('en');
    expect(t.targetLanguage).toBe('ko');
    expect(t.transcriptId).toBe('tr-1');
  });

  it('should throw if source and target language are the same', () => {
    expect(
      () =>
        new Translation({
          id: 'tl-1',
          sourceText: 'Hello',
          translatedText: 'Hello',
          sourceLanguage: 'en',
          targetLanguage: 'en',
          transcriptId: 'tr-1',
          createdAt: new Date(),
        })
    ).toThrow('Source and target language must differ');
  });

  it('should throw if sourceText is empty', () => {
    expect(
      () =>
        new Translation({
          id: 'tl-1',
          sourceText: '',
          translatedText: '안녕하세요',
          sourceLanguage: 'en',
          targetLanguage: 'ko',
          transcriptId: 'tr-1',
          createdAt: new Date(),
        })
    ).toThrow('Source text cannot be empty');
  });

  it('should throw if translatedText is empty', () => {
    expect(
      () =>
        new Translation({
          id: 'tl-1',
          sourceText: 'Hello',
          translatedText: '',
          sourceLanguage: 'en',
          targetLanguage: 'ko',
          transcriptId: 'tr-1',
          createdAt: new Date(),
        })
    ).toThrow('Translated text cannot be empty');
  });
});
