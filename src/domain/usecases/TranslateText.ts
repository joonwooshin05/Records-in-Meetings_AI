import type { Language } from '../entities/Language';
import type { Translation } from '../entities/Translation';
import type { TranslationPort } from '../ports/TranslationPort';

interface TranslateTextInput {
  text: string;
  from: Language;
  to: Language;
  transcriptId: string;
}

export class TranslateText {
  constructor(private readonly translationPort: TranslationPort) {}

  async execute(input: TranslateTextInput): Promise<Translation> {
    return this.translationPort.translate(input.text, input.from, input.to, input.transcriptId);
  }
}
