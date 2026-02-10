import type { Language } from './Language';

export interface TranslationProps {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  transcriptId: string;
  createdAt: Date;
}

export class Translation {
  readonly id: string;
  readonly sourceText: string;
  readonly translatedText: string;
  readonly sourceLanguage: Language;
  readonly targetLanguage: Language;
  readonly transcriptId: string;
  readonly createdAt: Date;

  constructor(props: TranslationProps) {
    if (!props.sourceText) throw new Error('Source text cannot be empty');
    if (!props.translatedText) throw new Error('Translated text cannot be empty');
    if (props.sourceLanguage === props.targetLanguage) {
      throw new Error('Source and target language must differ');
    }

    this.id = props.id;
    this.sourceText = props.sourceText;
    this.translatedText = props.translatedText;
    this.sourceLanguage = props.sourceLanguage;
    this.targetLanguage = props.targetLanguage;
    this.transcriptId = props.transcriptId;
    this.createdAt = props.createdAt;
  }
}
