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

    let translatedText: string;

    try {
      // Try server-side proxy first
      translatedText = await this.translateViaProxy(text, from, to);
    } catch (proxyError) {
      console.warn('[Translation] Proxy failed, trying direct API:', proxyError);
      // Fallback to direct API call
      translatedText = await this.translateDirect(text, from, to);
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

  private async translateViaProxy(text: string, from: Language, to: Language): Promise<string> {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, from, to }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error ?? `Proxy error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.translatedText) {
      throw new Error('Empty translation from proxy');
    }
    return data.translatedText;
  }

  private async translateDirect(text: string, from: Language, to: Language): Promise<string> {
    const langPair = `${LANGUAGE_CODES[from]}|${LANGUAGE_CODES[to]}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.responseData?.translatedText ?? '';

    if (!translatedText) {
      throw new Error('No translation returned from MyMemory');
    }

    return translatedText;
  }
}
