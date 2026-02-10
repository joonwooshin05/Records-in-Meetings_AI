import type { Language } from './Language';

export interface SummaryProps {
  id: string;
  meetingId: string;
  keyPoints: string[];
  fullSummary: string;
  language: Language;
  createdAt: Date;
}

export class Summary {
  readonly id: string;
  readonly meetingId: string;
  readonly keyPoints: readonly string[];
  readonly fullSummary: string;
  readonly language: Language;
  readonly createdAt: Date;

  constructor(props: SummaryProps) {
    if (props.keyPoints.length === 0) {
      throw new Error('Summary must have at least one key point');
    }
    if (!props.fullSummary) {
      throw new Error('Full summary cannot be empty');
    }

    this.id = props.id;
    this.meetingId = props.meetingId;
    this.keyPoints = [...props.keyPoints];
    this.fullSummary = props.fullSummary;
    this.language = props.language;
    this.createdAt = props.createdAt;
  }

  get keyPointCount(): number {
    return this.keyPoints.length;
  }
}
