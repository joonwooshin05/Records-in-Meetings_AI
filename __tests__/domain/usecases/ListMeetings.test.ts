import { describe, it, expect, vi } from 'vitest';
import { ListMeetings } from '@/src/domain/usecases/ListMeetings';
import { Meeting } from '@/src/domain/entities/Meeting';
import type { MeetingRepository } from '@/src/domain/repositories/MeetingRepository';

function createTestMeeting(id: string, updatedAt: Date) {
  return new Meeting({
    id,
    title: `Meeting ${id}`,
    createdAt: new Date(),
    updatedAt,
    sourceLanguage: 'en',
    targetLanguage: 'ko',
    transcripts: [],
    summary: null,
    status: 'idle',
  });
}

describe('ListMeetings', () => {
  it('should return all meetings sorted by updatedAt descending', async () => {
    const m1 = createTestMeeting('m-1', new Date('2026-01-01'));
    const m2 = createTestMeeting('m-2', new Date('2026-01-03'));
    const m3 = createTestMeeting('m-3', new Date('2026-01-02'));

    const repo: MeetingRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn().mockResolvedValue([m1, m2, m3]),
      findAllByUserId: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    };
    const useCase = new ListMeetings(repo);

    const result = await useCase.execute();
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('m-2');
    expect(result[1].id).toBe('m-3');
    expect(result[2].id).toBe('m-1');
  });

  it('should return empty array when no meetings', async () => {
    const repo: MeetingRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn().mockResolvedValue([]),
      findAllByUserId: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    };
    const useCase = new ListMeetings(repo);

    const result = await useCase.execute();
    expect(result).toHaveLength(0);
  });
});
