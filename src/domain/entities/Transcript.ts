import type { Language } from './Language';

export interface TranscriptProps {
  id: string;
  text: string;
  timestamp: number;
  language: Language;
  isFinal: boolean;
  speaker?: string;
  speakerId?: string;
  speakerPhotoURL?: string;
}

export class Transcript {
  readonly id: string;
  readonly text: string;
  readonly timestamp: number;
  readonly language: Language;
  readonly isFinal: boolean;
  readonly speaker?: string;
  readonly speakerId?: string;
  readonly speakerPhotoURL?: string;

  constructor(props: TranscriptProps) {
    if (!props.id) throw new Error('Transcript id cannot be empty');
    if (!props.text) throw new Error('Transcript text cannot be empty');
    if (props.timestamp < 0) throw new Error('Timestamp must be non-negative');

    this.id = props.id;
    this.text = props.text;
    this.timestamp = props.timestamp;
    this.language = props.language;
    this.isFinal = props.isFinal;
    this.speaker = props.speaker;
    this.speakerId = props.speakerId;
    this.speakerPhotoURL = props.speakerPhotoURL;
  }
}
