import { describe, it, expect, vi } from 'vitest';
import { SaveMeeting } from '@/src/domain/usecases/SaveMeeting';
import { Meeting } from '@/src/domain/entities/Meeting';
import type { MeetingRepository } from '@/src/domain/repositories/MeetingRepository';

function createMockRepo(): MeetingRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn(),
    findAll: vi.fn(),
    findAllByUserId: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  };
}

function createTestMeeting() {
  return new Meeting({
    id: 'm-1',
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

describe('SaveMeeting', () => {
  it('should save a meeting through the repository', async () => {
    const repo = createMockRepo();
    const useCase = new SaveMeeting(repo);
    const meeting = createTestMeeting();

    await useCase.execute(meeting);
    expect(repo.save).toHaveBeenCalledWith(meeting);
  });
});
