import type { Language } from '../entities/Language';
import type { Transcript } from '../entities/Transcript';
import type { Summary } from '../entities/Summary';
import type { SummarizationPort } from '../ports/SummarizationPort';

interface GenerateSummaryInput {
  transcripts: Transcript[];
  language: Language;
  meetingId: string;
}

export class GenerateSummary {
  constructor(private readonly summarizationPort: SummarizationPort) {}

  async execute(input: GenerateSummaryInput): Promise<Summary> {
    if (input.transcripts.length === 0) {
      throw new Error('Cannot generate summary without transcripts');
    }

    return this.summarizationPort.summarize(input.transcripts, input.language, input.meetingId);
  }
}
