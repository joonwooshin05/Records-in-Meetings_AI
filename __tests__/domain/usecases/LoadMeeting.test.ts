import { describe, it, expect, vi } from 'vitest';
import { LoadMeeting } from '@/src/domain/usecases/LoadMeeting';
import { Meeting } from '@/src/domain/entities/Meeting';
import type { MeetingRepository } from '@/src/domain/repositories/MeetingRepository';

function createTestMeeting(id = 'm-1') {
  return new Meeting({
    id,
    title: 'Test Meeting',
    createdAt: new Date(),
    updatedAt: new Date(),
    sourceLanguage: 'en',
    targetLanguage: 'ko',
    transcripts: [],
    summary: null,
    status: 'idle',
  });
}

describe('LoadMeeting', () => {
  it('should return a meeting by id', async () => {
    const meeting = createTestMeeting();
    const repo: MeetingRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(meeting),
      findAll: vi.fn(),
      findAllByUserId: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    };
    const useCase = new LoadMeeting(repo);

    const result = await useCase.execute('m-1');
    expect(result).toBe(meeting);
    expect(repo.findById).toHaveBeenCalledWith('m-1');
  });

  it('should return null if meeting not found', async () => {
    const repo: MeetingRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findAll: vi.fn(),
      findAllByUserId: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    };
    const useCase = new LoadMeeting(repo);

    const result = await useCase.execute('nonexistent');
    expect(result).toBeNull();
  });
});
