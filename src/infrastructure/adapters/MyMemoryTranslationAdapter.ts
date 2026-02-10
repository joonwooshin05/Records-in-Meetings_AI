import type { Language } from '@/src/domain/entities/Language';
import { Translation } from '@/src/domain/entities/Translation';
import type { TranslationPort } from '@/src/domain/ports/TranslationPort';
import { v4 as uuidv4 } from 'uuid';

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

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, from, to }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error ?? `Translation error: ${response.status}`);
    }

    const data = await response.json();

    return new Translation({
      id: uuidv4(),
      sourceText: text,
      translatedText: data.translatedText,
      sourceLanguage: from,
      targetLanguage: to,
      transcriptId,
      createdAt: new Date(),
    });
  }
}
