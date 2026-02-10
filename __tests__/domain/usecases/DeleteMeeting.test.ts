import { describe, it, expect, vi } from 'vitest';
import { DeleteMeeting } from '@/src/domain/usecases/DeleteMeeting';
import type { MeetingRepository } from '@/src/domain/repositories/MeetingRepository';

describe('DeleteMeeting', () => {
  it('should delete a meeting through the repository', async () => {
    const repo: MeetingRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findAllByUserId: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
      update: vi.fn(),
    };
    const useCase = new DeleteMeeting(repo);

    await useCase.execute('m-1');
    expect(repo.delete).toHaveBeenCalledWith('m-1');
  });
});
