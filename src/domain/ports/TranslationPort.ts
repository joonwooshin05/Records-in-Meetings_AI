import type { Language } from '../entities/Language';
import type { Translation } from '../entities/Translation';

export interface TranslationPort {
  translate(text: string, from: Language, to: Language, transcriptId: string): Promise<Translation>;
}
