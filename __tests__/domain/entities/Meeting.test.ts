import { describe, it, expect } from 'vitest';
import { Meeting } from '@/src/domain/entities/Meeting';
import { Transcript } from '@/src/domain/entities/Transcript';
import { Summary } from '@/src/domain/entities/Summary';

function createTestMeeting(overrides?: Partial<ConstructorParameters<typeof Meeting>[0]>) {
  return new Meeting({
    id: 'm-1',
    title: 'Team Standup',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    sourceLanguage: 'en',
    targetLanguage: 'ko',
    transcripts: [],
    summary: null,
    status: 'idle',
    ...overrides,
  });
}

describe('Meeting', () => {
  it('should create a meeting with idle status', () => {
    const m = createTestMeeting();
    expect(m.id).toBe('m-1');
    expect(m.title).toBe('Team Standup');
    expect(m.status).toBe('idle');
    expect(m.transcriptCount).toBe(0);
    expect(m.summary).toBeNull();
  });

  it('should transition from idle to recording', () => {
    const m = createTestMeeting().start();
    expect(m.status).toBe('recording');
  });

  it('should transition from recording to paused', () => {
    const m = createTestMeeting().start().pause();
    expect(m.status).toBe('paused');
  });

  it('should transition from paused to recording', () => {
    const m = createTestMeeting().start().pause().start();
    expect(m.status).toBe('recording');
  });

  it('should transition from recording to completed', () => {
    const m = createTestMeeting().start().complete();
    expect(m.status).toBe('completed');
  });

  it('should transition from paused to completed', () => {
    const m = createTestMeeting().start().pause().complete();
    expect(m.status).toBe('completed');
  });

  it('should not start a completed meeting', () => {
    const m = createTestMeeting().start().complete();
    expect(() => m.start()).toThrow('Invalid status transition');
  });

  it('should not pause an idle meeting', () => {
    const m = createTestMeeting();
    expect(() => m.pause()).toThrow('Invalid status transition');
  });

  it('should not complete an idle meeting', () => {
    const m = createTestMeeting();
    expect(() => m.complete()).toThrow('Invalid status transition');
  });

  it('should add a transcript and return a new Meeting (immutability)', () => {
    const m = createTestMeeting().start();
    const transcript = new Transcript({
      id: 'tr-1',
      text: 'Hello',
      timestamp: 0,
      language: 'en',
      isFinal: true,
    });
    const updated = m.addTranscript(transcript);
    expect(updated.transcriptCount).toBe(1);
    expect(updated.transcripts[0].text).toBe('Hello');
    expect(m.transcriptCount).toBe(0); // original unchanged
  });

  it('should set summary and return a new Meeting', () => {
    const m = createTestMeeting().start().complete();
    const summary = new Summary({
      id: 's-1',
      meetingId: 'm-1',
      keyPoints: ['Key point'],
      fullSummary: 'Full summary',
      language: 'en',
      createdAt: new Date(),
    });
    const updated = m.setSummary(summary);
    expect(updated.summary).not.toBeNull();
    expect(updated.summary!.keyPointCount).toBe(1);
    expect(m.summary).toBeNull(); // original unchanged
  });

  it('should compute duration from transcripts', () => {
    const m = createTestMeeting().start();
    const t1 = new Transcript({ id: 'tr-1', text: 'Hello', timestamp: 0, language: 'en', isFinal: true });
    const t2 = new Transcript({ id: 'tr-2', text: 'World', timestamp: 5000, language: 'en', isFinal: true });
    const updated = m.addTranscript(t1).addTranscript(t2);
    expect(updated.duration).toBe(5000);
  });

  it('should return 0 duration with no transcripts', () => {
    const m = createTestMeeting();
    expect(m.duration).toBe(0);
  });

  it('should throw if title is empty', () => {
    expect(() => createTestMeeting({ title: '' })).toThrow('Meeting title cannot be empty');
  });
});
