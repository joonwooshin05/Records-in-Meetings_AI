import type { Language } from '../entities/Language';
import type { Transcript } from '../entities/Transcript';
import type { Summary } from '../entities/Summary';

export interface SummarizationPort {
  summarize(transcripts: Transcript[], language: Language, meetingId: string): Promise<Summary>;
}
