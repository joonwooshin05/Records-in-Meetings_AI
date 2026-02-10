import { describe, it, expect, vi } from 'vitest';
import { StopTranscription } from '@/src/domain/usecases/StopTranscription';
import { Meeting } from '@/src/domain/entities/Meeting';
import type { SpeechRecognitionPort } from '@/src/domain/ports/SpeechRecognitionPort';

function createMockSpeechPort(): SpeechRecognitionPort {
  return {
    start: vi.fn(),
    stop: vi.fn(),
    onResult: vi.fn(),
    onError: vi.fn(),
    onEnd: vi.fn(),
    isSupported: vi.fn().mockReturnValue(true),
  };
}

describe('StopTranscription', () => {
  it('should stop speech recognition and return completed meeting', async () => {
    const speech = createMockSpeechPort();
    const useCase = new StopTranscription(speech);
    const meeting = new Meeting({
      id: 'm-1',
      title: 'Test',
      createdAt: new Date(),
      updatedAt: new Date(),
      sourceLanguage: 'en',
      targetLanguage: 'ko',
      transcripts: [],
      summary: null,
      status: 'recording',
    });

    const result = await useCase.execute(meeting);

    expect(result.status).toBe('completed');
    expect(speech.stop).toHaveBeenCalled();
  });
});
