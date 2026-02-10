import { describe, it, expect } from 'vitest';
import { Summary } from '@/src/domain/entities/Summary';

describe('Summary', () => {
  it('should create a summary with key points', () => {
    const s = new Summary({
      id: 's-1',
      meetingId: 'm-1',
      keyPoints: ['Point 1', 'Point 2'],
      fullSummary: 'Full summary text',
      language: 'en',
      createdAt: new Date('2026-01-01'),
    });
    expect(s.id).toBe('s-1');
    expect(s.meetingId).toBe('m-1');
    expect(s.keyPoints).toEqual(['Point 1', 'Point 2']);
    expect(s.fullSummary).toBe('Full summary text');
    expect(s.keyPointCount).toBe(2);
  });

  it('should throw if keyPoints is empty', () => {
    expect(
      () =>
        new Summary({
          id: 's-1',
          meetingId: 'm-1',
          keyPoints: [],
          fullSummary: 'Full summary text',
          language: 'en',
          createdAt: new Date(),
        })
    ).toThrow('Summary must have at least one key point');
  });

  it('should throw if fullSummary is empty', () => {
    expect(
      () =>
        new Summary({
          id: 's-1',
          meetingId: 'm-1',
          keyPoints: ['Point 1'],
          fullSummary: '',
          language: 'en',
          createdAt: new Date(),
        })
    ).toThrow('Full summary cannot be empty');
  });
});
