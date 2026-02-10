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

    const langPair = `autodetect|${LANGUAGE_CODES[to]}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Translation API error: ${response.status}`);
        }

        const data = await response.json();
        const translatedText = data.responseData?.translatedText ?? '';

        if (!translatedText || translatedText === text) {
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
      } catch (e) {
        lastError = e instanceof Error ? e : new Error('Translation failed');
        if (attempt < 1) await new Promise((r) => setTimeout(r, 1000));
      }
    }
    throw lastError!;
  }
}
