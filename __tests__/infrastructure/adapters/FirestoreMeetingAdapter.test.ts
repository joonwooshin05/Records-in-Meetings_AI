import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirestoreMeetingAdapter } from '@/src/infrastructure/adapters/FirestoreMeetingAdapter';
import { Meeting } from '@/src/domain/entities/Meeting';
import { Transcript } from '@/src/domain/entities/Transcript';
import { Participant } from '@/src/domain/entities/Participant';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, ...pathSegments: string[]) => ({ path: pathSegments.join('/') })),
  doc: vi.fn((_db, ...pathSegments: string[]) => ({ path: pathSegments.join('/') })),
  setDoc: vi.fn().mockResolvedValue(undefined),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
  getDocs: vi.fn().mockResolvedValue({ docs: [] }),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
  onSnapshot: vi.fn().mockReturnValue(() => {}),
  query: vi.fn((...args: unknown[]) => args[0]),
  orderBy: vi.fn((field: string) => ({ field })),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}));

function createTestMeeting(): Meeting {
  return new Meeting({
    id: 'm-1',
    hostId: 'host-1',
    meetingCode: 'ABC-123',
    title: 'Test Meeting',
    createdAt: new Date(),
    updatedAt: new Date(),
    sourceLanguage: 'en',
    targetLanguage: 'ko',
    transcripts: [],
    summary: null,
    status: 'idle',
    participants: [
      new Participant({
        userId: 'host-1',
        displayName: 'Host',
        role: 'host',
        joinedAt: new Date(),
        targetLanguage: 'ko',
      }),
    ],
  });
}

describe('FirestoreMeetingAdapter', () => {
  let adapter: FirestoreMeetingAdapter;
  const mockDb = {} as any;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new FirestoreMeetingAdapter(mockDb);
  });

  it('should create a room with meeting data and host participant', async () => {
    const { setDoc } = await import('firebase/firestore');
    const meeting = createTestMeeting();

    await adapter.createRoom(meeting);

    expect(setDoc).toHaveBeenCalledTimes(2);
    expect(setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'meetings/ABC-123' }),
      expect.objectContaining({
        id: 'm-1',
        hostId: 'host-1',
        title: 'Test Meeting',
        status: 'idle',
      })
    );
  });

  it('should return null when joining non-existent room', async () => {
    const participant = new Participant({
      userId: 'u-2',
      displayName: 'Bob',
      role: 'participant',
      joinedAt: new Date(),
      targetLanguage: 'en',
    });

    const result = await adapter.joinRoom('XYZ-999', participant);
    expect(result).toBeNull();
  });

  it('should join an existing room', async () => {
    const { getDoc, setDoc } = await import('firebase/firestore');
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        id: 'm-1',
        hostId: 'host-1',
        meetingCode: 'ABC-123',
        title: 'Test Meeting',
        sourceLanguage: 'en',
        targetLanguage: 'ko',
        status: 'recording',
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
      }),
    } as any);

    const participant = new Participant({
      userId: 'u-2',
      displayName: 'Bob',
      role: 'participant',
      joinedAt: new Date(),
      targetLanguage: 'en',
    });

    const result = await adapter.joinRoom('ABC-123', participant);
    expect(result).not.toBeNull();
    expect(result!.title).toBe('Test Meeting');
    expect(setDoc).toHaveBeenCalled();
  });

  it('should push a transcript to Firestore', async () => {
    const { setDoc } = await import('firebase/firestore');
    const transcript = new Transcript({
      id: 't-1',
      text: 'Hello',
      timestamp: 1000,
      language: 'en',
      isFinal: true,
    });

    await adapter.pushTranscript('ABC-123', transcript);

    expect(setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'meetings/ABC-123/transcripts/t-1' }),
      expect.objectContaining({
        id: 't-1',
        text: 'Hello',
        timestamp: 1000,
        isFinal: true,
      })
    );
  });

  it('should leave a room by deleting participant doc', async () => {
    const { deleteDoc } = await import('firebase/firestore');

    await adapter.leaveRoom('ABC-123', 'u-2');

    expect(deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'meetings/ABC-123/participants/u-2' })
    );
  });

  it('should update meeting status', async () => {
    const { setDoc } = await import('firebase/firestore');

    await adapter.updateMeetingStatus('ABC-123', 'recording');

    expect(setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'meetings/ABC-123' }),
      expect.objectContaining({ status: 'recording' }),
      { merge: true }
    );
  });
});
