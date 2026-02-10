import { describe, it, expect, vi } from 'vitest';
import { MeetingService } from '@/src/application/services/MeetingService';
import type { MeetingRepository } from '@/src/domain/repositories/MeetingRepository';

function createMockRepo(): MeetingRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue([]),
    findAllByUserId: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
  };
}

describe('MeetingService', () => {
  it('should create a new meeting with generated ID', async () => {
    const repo = createMockRepo();
    const service = new MeetingService(repo);

    const meeting = await service.createMeeting('Team Standup', 'en', 'ko');

    expect(meeting.title).toBe('Team Standup');
    expect(meeting.status).toBe('idle');
    expect(meeting.sourceLanguage).toBe('en');
    expect(meeting.targetLanguage).toBe('ko');
    expect(meeting.id).toBeTruthy();
    expect(repo.save).toHaveBeenCalledWith(meeting);
  });

  it('should list all meetings sorted by date', async () => {
    const repo = createMockRepo();
    const service = new MeetingService(repo);

    await service.listMeetings();
    expect(repo.findAll).toHaveBeenCalled();
  });

  it('should get a meeting by id', async () => {
    const repo = createMockRepo();
    const service = new MeetingService(repo);

    await service.getMeeting('m-1');
    expect(repo.findById).toHaveBeenCalledWith('m-1');
  });

  it('should delete a meeting', async () => {
    const repo = createMockRepo();
    const service = new MeetingService(repo);

    await service.deleteMeeting('m-1');
    expect(repo.delete).toHaveBeenCalledWith('m-1');
  });

  it('should save a meeting', async () => {
    const repo = createMockRepo();
    const service = new MeetingService(repo);

    const meeting = await service.createMeeting('Test', 'en', 'ko');
    vi.mocked(repo.save).mockClear();

    await service.saveMeeting(meeting);
    expect(repo.save).toHaveBeenCalledWith(meeting);
  });
});
