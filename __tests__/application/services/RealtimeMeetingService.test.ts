import { describe, it, expect, vi } from 'vitest';
import { RealtimeMeetingService } from '@/src/application/services/RealtimeMeetingService';
import type { MeetingRepository } from '@/src/domain/repositories/MeetingRepository';
import type { RealtimeMeetingPort } from '@/src/domain/ports/RealtimeMeetingPort';
import { Transcript } from '@/src/domain/entities/Transcript';

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

function createMockRealtimePort(): RealtimeMeetingPort {
  return {
    createRoom: vi.fn().mockResolvedValue(undefined),
    joinRoom: vi.fn().mockResolvedValue(null),
    leaveRoom: vi.fn().mockResolvedValue(undefined),
    findRoomByCode: vi.fn().mockResolvedValue(null),
    pushTranscript: vi.fn().mockResolvedValue(undefined),
    onTranscriptsChanged: vi.fn().mockReturnValue(() => {}),
    onParticipantsChanged: vi.fn().mockReturnValue(() => {}),
    updateMeetingStatus: vi.fn().mockResolvedValue(undefined),
    onMeetingStatusChanged: vi.fn().mockReturnValue(() => {}),
  };
}

describe('RealtimeMeetingService', () => {
  it('should create a realtime meeting with code and save locally + remotely', async () => {
    const repo = createMockRepo();
    const port = createMockRealtimePort();
    const service = new RealtimeMeetingService(repo, port);

    const meeting = await service.createRealtimeMeeting(
      'Team Standup', 'en', 'ko', 'user-1', 'Alice'
    );

    expect(meeting.title).toBe('Team Standup');
    expect(meeting.meetingCode).toMatch(/^[A-Z2-9]{3}-[A-Z2-9]{3}$/);
    expect(meeting.hostId).toBe('user-1');
    expect(meeting.participantCount).toBe(1);
    expect(repo.save).toHaveBeenCalledWith(meeting);
    expect(port.createRoom).toHaveBeenCalledWith(meeting);
  });

  it('should join a meeting as participant', async () => {
    const repo = createMockRepo();
    const port = createMockRealtimePort();
    const service = new RealtimeMeetingService(repo, port);

    await service.joinMeeting('ABC-123', 'user-2', 'Bob', 'en');

    expect(port.joinRoom).toHaveBeenCalledWith(
      'ABC-123',
      expect.objectContaining({
        userId: 'user-2',
        displayName: 'Bob',
        role: 'participant',
        targetLanguage: 'en',
      })
    );
  });

  it('should leave a meeting', async () => {
    const repo = createMockRepo();
    const port = createMockRealtimePort();
    const service = new RealtimeMeetingService(repo, port);

    await service.leaveMeeting('ABC-123', 'user-2');
    expect(port.leaveRoom).toHaveBeenCalledWith('ABC-123', 'user-2');
  });

  it('should sync a transcript to Firestore', async () => {
    const repo = createMockRepo();
    const port = createMockRealtimePort();
    const service = new RealtimeMeetingService(repo, port);

    const transcript = new Transcript({
      id: 't-1',
      text: 'Hello',
      timestamp: 1000,
      language: 'en',
      isFinal: true,
    });

    await service.syncTranscript('ABC-123', transcript);
    expect(port.pushTranscript).toHaveBeenCalledWith('ABC-123', transcript);
  });

  it('should subscribe to transcripts', () => {
    const repo = createMockRepo();
    const port = createMockRealtimePort();
    const service = new RealtimeMeetingService(repo, port);

    const cb = vi.fn();
    const unsub = service.subscribeToTranscripts('ABC-123', cb);

    expect(port.onTranscriptsChanged).toHaveBeenCalledWith('ABC-123', cb);
    expect(typeof unsub).toBe('function');
  });

  it('should update meeting status', async () => {
    const repo = createMockRepo();
    const port = createMockRealtimePort();
    const service = new RealtimeMeetingService(repo, port);

    await service.updateStatus('ABC-123', 'recording');
    expect(port.updateMeetingStatus).toHaveBeenCalledWith('ABC-123', 'recording');
  });
});
