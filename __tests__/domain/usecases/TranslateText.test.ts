import { describe, it, expect, vi } from 'vitest';
import { TranslateText } from '@/src/domain/usecases/TranslateText';
import { Translation } from '@/src/domain/entities/Translation';
import type { TranslationPort } from '@/src/domain/ports/TranslationPort';

describe('TranslateText', () => {
  it('should translate text using the translation port', async () => {
    const mockTranslation = new Translation({
      id: 'tl-1',
      sourceText: 'Hello',
      translatedText: '안녕하세요',
      sourceLanguage: 'en',
      targetLanguage: 'ko',
      transcriptId: 'tr-1',
      createdAt: new Date(),
    });

    const port: TranslationPort = {
      translate: vi.fn().mockResolvedValue(mockTranslation),
    };
    const useCase = new TranslateText(port);

    const result = await useCase.execute({
      text: 'Hello',
      from: 'en',
      to: 'ko',
      transcriptId: 'tr-1',
    });

    expect(result.translatedText).toBe('안녕하세요');
    expect(port.translate).toHaveBeenCalledWith('Hello', 'en', 'ko', 'tr-1');
  });
});
