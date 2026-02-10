import type { Language } from '@/src/domain/entities/Language';
import type { Transcript } from '@/src/domain/entities/Transcript';
import { Summary } from '@/src/domain/entities/Summary';
import type { SummarizationPort } from '@/src/domain/ports/SummarizationPort';
import { v4 as uuidv4 } from 'uuid';

export class LocalSummarizationAdapter implements SummarizationPort {
  async summarize(
    transcripts: Transcript[],
    language: Language,
    meetingId: string
  ): Promise<Summary> {
    const finalTranscripts = transcripts.filter((t) => t.isFinal);

    if (finalTranscripts.length === 0) {
      return new Summary({
        id: uuidv4(),
        meetingId,
        keyPoints: ['No transcripts available'],
        fullSummary: 'No transcripts to summarize.',
        language,
        createdAt: new Date(),
      });
    }

    const sentences = finalTranscripts.map((t) => t.text.trim()).filter((s) => s.length > 0);

    const wordFrequency = this.buildWordFrequency(sentences);
    const scoredSentences = sentences.map((sentence, index) => ({
      sentence,
      index,
      score: this.scoreSentence(sentence, wordFrequency),
    }));

    scoredSentences.sort((a, b) => b.score - a.score);

    const keyPointCount = Math.min(Math.max(3, Math.ceil(sentences.length * 0.3)), 7);
    const keyPoints = scoredSentences
      .slice(0, keyPointCount)
      .sort((a, b) => a.index - b.index)
      .map((s) => s.sentence);

    const summaryCount = Math.min(Math.max(3, Math.ceil(sentences.length * 0.5)), 10);
    const summarySentences = scoredSentences
      .slice(0, summaryCount)
      .sort((a, b) => a.index - b.index)
      .map((s) => s.sentence);
    const fullSummary = summarySentences.join(' ');

    return new Summary({
      id: uuidv4(),
      meetingId,
      keyPoints,
      fullSummary,
      language,
      createdAt: new Date(),
    });
  }

  private buildWordFrequency(sentences: string[]): Map<string, number> {
    const freq = new Map<string, number>();
    for (const sentence of sentences) {
      const words = this.tokenize(sentence);
      for (const word of words) {
        freq.set(word, (freq.get(word) ?? 0) + 1);
      }
    }
    return freq;
  }

  private scoreSentence(sentence: string, wordFrequency: Map<string, number>): number {
    const words = this.tokenize(sentence);
    if (words.length === 0) return 0;

    let score = 0;
    for (const word of words) {
      score += wordFrequency.get(word) ?? 0;
    }

    // Normalize by sentence length to avoid bias toward long sentences
    return score / words.length;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .split(/\s+/)
      .filter((w) => w.length > 1);
  }
}
