import { describe, it, expect, vi } from 'vitest';
import { StartTranscription } from '@/src/domain/usecases/StartTranscription';
import { Meeting } from '@/src/domain/entities/Meeting';
import type { SpeechRecognitionPort } from '@/src/domain/ports/SpeechRecognitionPort';

function createMockSpeechPort(overrides?: Partial<SpeechRecognitionPort>): SpeechRecognitionPort {
  return {
    start: vi.fn(),
    stop: vi.fn(),
    onResult: vi.fn(),
    onError: vi.fn(),
    onEnd: vi.fn(),
    isSupported: vi.fn().mockReturnValue(true),
    ...overrides,
  };
}

function createTestMeeting() {
  return new Meeting({
    id: 'm-1',
    title: 'Test',
    createdAt: new Date(),
    updatedAt: new Date(),
    sourceLanguage: 'en',
    targetLanguage: 'ko',
    transcripts: [],
    summary: null,
    status: 'idle',
  });
}

describe('StartTranscription', () => {
  it('should start speech recognition and return recording meeting', async () => {
    const speech = createMockSpeechPort();
    const useCase = new StartTranscription(speech);
    const meeting = createTestMeeting();

    const result = await useCase.execute({ meeting, language: 'en' });

    expect(result.status).toBe('recording');
    expect(speech.start).toHaveBeenCalledWith('en');
  });

  it('should throw if speech recognition is not supported', async () => {
    const speech = createMockSpeechPort({ isSupported: vi.fn().mockReturnValue(false) });
    const useCase = new StartTranscription(speech);

    await expect(
      useCase.execute({ meeting: createTestMeeting(), language: 'en' })
    ).rejects.toThrow('Speech recognition is not supported');
  });
});
