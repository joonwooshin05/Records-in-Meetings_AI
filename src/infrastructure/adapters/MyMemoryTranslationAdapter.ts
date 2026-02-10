import type { Language } from '@/src/domain/entities/Language';
import { Translation } from '@/src/domain/entities/Translation';
import type { TranslationPort } from '@/src/domain/ports/TranslationPort';
import { v4 as uuidv4 } from 'uuid';

const LANGUAGE_CODES: Record<Language, string> = {
  ko: 'ko',
  en: 'en',
  ja: 'ja',
  zh: 'zh-CN',
};

export class MyMemoryTranslationAdapter implements TranslationPort {
  async translate(
    text: string,
    from: Language,
    to: Language,
    transcriptId: string
  ): Promise<Translation> {
    if (from === to) {
      return new Translation({
        id: uuidv4(),
        sourceText: text,
        translatedText: text,
        sourceLanguage: from,
        targetLanguage: to,
        transcriptId,
        createdAt: new Date(),
      });
    }

    const langPair = `${LANGUAGE_CODES[from]}|${LANGUAGE_CODES[to]}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.responseData?.translatedText ?? '';

    if (!translatedText) {
      throw new Error('No translation returned');
    }

    return new Translation({
      id: uuidv4(),
      sourceText: text,
      translatedText,
      sourceLanguage: from,
      targetLanguage: to,
      transcriptId,
      createdAt: new Date(),
    });
  }
}
