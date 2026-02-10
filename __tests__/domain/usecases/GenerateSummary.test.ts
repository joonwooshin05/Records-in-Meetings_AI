import { describe, it, expect, vi } from 'vitest';
import { GenerateSummary } from '@/src/domain/usecases/GenerateSummary';
import { Transcript } from '@/src/domain/entities/Transcript';
import { Summary } from '@/src/domain/entities/Summary';
import type { SummarizationPort } from '@/src/domain/ports/SummarizationPort';

describe('GenerateSummary', () => {
  it('should generate a summary from transcripts', async () => {
    const mockSummary = new Summary({
      id: 's-1',
      meetingId: 'm-1',
      keyPoints: ['Point 1'],
      fullSummary: 'Full summary',
      language: 'en',
      createdAt: new Date(),
    });

    const port: SummarizationPort = {
      summarize: vi.fn().mockResolvedValue(mockSummary),
    };
    const useCase = new GenerateSummary(port);

    const transcripts = [
      new Transcript({ id: 'tr-1', text: 'Hello', timestamp: 0, language: 'en', isFinal: true }),
    ];

    const result = await useCase.execute({
      transcripts,
      language: 'en',
      meetingId: 'm-1',
    });

    expect(result.keyPointCount).toBe(1);
    expect(port.summarize).toHaveBeenCalledWith(transcripts, 'en', 'm-1');
  });

  it('should throw if transcripts are empty', async () => {
    const port: SummarizationPort = {
      summarize: vi.fn(),
    };
    const useCase = new GenerateSummary(port);

    await expect(
      useCase.execute({ transcripts: [], language: 'en', meetingId: 'm-1' })
    ).rejects.toThrow('Cannot generate summary without transcripts');
  });
});
