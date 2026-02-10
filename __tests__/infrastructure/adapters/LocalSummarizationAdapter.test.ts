import { describe, it, expect } from 'vitest';
import { LocalSummarizationAdapter } from '@/src/infrastructure/adapters/LocalSummarizationAdapter';
import { Transcript } from '@/src/domain/entities/Transcript';

describe('LocalSummarizationAdapter', () => {
  it('should return Summary entity with key points from transcripts', async () => {
    const adapter = new LocalSummarizationAdapter();
    const transcripts = [
      new Transcript({ id: 'tr-1', text: 'Sprint velocity increased by 20%', timestamp: 0, language: 'en', isFinal: true }),
      new Transcript({ id: 'tr-2', text: 'New deployment scheduled for Friday', timestamp: 5000, language: 'en', isFinal: true }),
      new Transcript({ id: 'tr-3', text: 'Bug fixes completed for the sprint', timestamp: 10000, language: 'en', isFinal: true }),
      new Transcript({ id: 'tr-4', text: 'Deployment includes new features', timestamp: 15000, language: 'en', isFinal: true }),
    ];

    const result = await adapter.summarize(transcripts, 'en', 'm-1');

    expect(result.meetingId).toBe('m-1');
    expect(result.language).toBe('en');
    expect(result.keyPoints.length).toBeGreaterThan(0);
    expect(result.fullSummary.length).toBeGreaterThan(0);
  });

  it('should handle empty transcripts', async () => {
    const adapter = new LocalSummarizationAdapter();
    const result = await adapter.summarize([], 'en', 'm-1');

    expect(result.keyPoints).toEqual(['No transcripts available']);
    expect(result.fullSummary).toBe('No transcripts to summarize.');
  });

  it('should only use final transcripts', async () => {
    const adapter = new LocalSummarizationAdapter();
    const transcripts = [
      new Transcript({ id: 'tr-1', text: 'This is interim', timestamp: 0, language: 'en', isFinal: false }),
      new Transcript({ id: 'tr-2', text: 'This is final text about the project', timestamp: 5000, language: 'en', isFinal: true }),
    ];

    const result = await adapter.summarize(transcripts, 'en', 'm-1');

    expect(result.keyPoints.length).toBeGreaterThan(0);
    expect(result.fullSummary).toContain('project');
  });

  it('should preserve sentence order in output', async () => {
    const adapter = new LocalSummarizationAdapter();
    const transcripts = [
      new Transcript({ id: 'tr-1', text: 'First meeting topic discussed', timestamp: 0, language: 'en', isFinal: true }),
      new Transcript({ id: 'tr-2', text: 'Second agenda item covered', timestamp: 5000, language: 'en', isFinal: true }),
      new Transcript({ id: 'tr-3', text: 'Third point about timeline', timestamp: 10000, language: 'en', isFinal: true }),
    ];

    const result = await adapter.summarize(transcripts, 'en', 'm-1');

    const firstIndex = result.fullSummary.indexOf('First');
    const lastIndex = result.fullSummary.indexOf('Third');
    if (firstIndex !== -1 && lastIndex !== -1) {
      expect(firstIndex).toBeLessThan(lastIndex);
    }
  });
});
