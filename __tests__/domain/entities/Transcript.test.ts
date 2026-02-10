import { describe, it, expect } from 'vitest';
import { Transcript } from '@/src/domain/entities/Transcript';

describe('Transcript', () => {
  it('should create a valid transcript with required fields', () => {
    const transcript = new Transcript({
      id: 'tr-1',
      text: 'Hello world',
      timestamp: 1000,
      language: 'en',
      isFinal: true,
    });
    expect(transcript.id).toBe('tr-1');
    expect(transcript.text).toBe('Hello world');
    expect(transcript.timestamp).toBe(1000);
    expect(transcript.language).toBe('en');
    expect(transcript.isFinal).toBe(true);
    expect(transcript.speaker).toBeUndefined();
  });

  it('should create a transcript with optional speaker', () => {
    const transcript = new Transcript({
      id: 'tr-2',
      text: 'Hi there',
      timestamp: 2000,
      language: 'ko',
      isFinal: false,
      speaker: 'Alice',
    });
    expect(transcript.speaker).toBe('Alice');
  });

  it('should throw if text is empty', () => {
    expect(
      () =>
        new Transcript({
          id: 'tr-1',
          text: '',
          timestamp: 1000,
          language: 'en',
          isFinal: true,
        })
    ).toThrow('Transcript text cannot be empty');
  });

  it('should throw if timestamp is negative', () => {
    expect(
      () =>
        new Transcript({
          id: 'tr-1',
          text: 'Hello',
          timestamp: -1,
          language: 'en',
          isFinal: true,
        })
    ).toThrow('Timestamp must be non-negative');
  });

  it('should throw if id is empty', () => {
    expect(
      () =>
        new Transcript({
          id: '',
          text: 'Hello',
          timestamp: 0,
          language: 'en',
          isFinal: true,
        })
    ).toThrow('Transcript id cannot be empty');
  });
});
