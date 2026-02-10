import type { Language } from '@/src/domain/entities/Language';
import type { MeetingRepository } from '@/src/domain/repositories/MeetingRepository';
import type { RealtimeMeetingPort } from '@/src/domain/ports/RealtimeMeetingPort';
import { Meeting } from '@/src/domain/entities/Meeting';
import { Participant } from '@/src/domain/entities/Participant';
import type { Transcript } from '@/src/domain/entities/Transcript';
import { generateMeetingCode } from '@/src/domain/utils/meetingCode';
import { v4 as uuidv4 } from 'uuid';

export class RealtimeMeetingService {
  constructor(
    private readonly repository: MeetingRepository,
    private readonly realtimePort: RealtimeMeetingPort
  ) {}

  async createRealtimeMeeting(
    title: string,
    sourceLanguage: Language,
    targetLanguage: Language,
    userId: string,
    displayName: string
  ): Promise<Meeting> {
    const meetingCode = generateMeetingCode();
    const now = new Date();
    const meeting = new Meeting({
      id: uuidv4(),
      userId,
      hostId: userId,
      meetingCode,
      title,
      createdAt: now,
      updatedAt: now,
      sourceLanguage,
      targetLanguage,
      transcripts: [],
      participants: [
        new Participant({
          userId,
          displayName,
          role: 'host',
          joinedAt: now,
          targetLanguage,
        }),
      ],
      summary: null,
      status: 'idle',
    });

    await this.repository.save(meeting);
    await this.realtimePort.createRoom(meeting);
    return meeting;
  }

  async joinMeeting(
    meetingCode: string,
    userId: string,
    displayName: string,
    targetLanguage: Language
  ): Promise<Meeting | null> {
    const participant = new Participant({
      userId,
      displayName,
      role: 'participant',
      joinedAt: new Date(),
      targetLanguage,
    });
    return this.realtimePort.joinRoom(meetingCode, participant);
  }

  async leaveMeeting(meetingCode: string, userId: string): Promise<void> {
    await this.realtimePort.leaveRoom(meetingCode, userId);
  }

  async syncTranscript(meetingCode: string, transcript: Transcript): Promise<void> {
    await this.realtimePort.pushTranscript(meetingCode, transcript);
  }

  subscribeToTranscripts(
    meetingCode: string,
    callback: (transcripts: Transcript[]) => void
  ): () => void {
    return this.realtimePort.onTranscriptsChanged(meetingCode, callback);
  }

  subscribeToParticipants(
    meetingCode: string,
    callback: (participants: Participant[]) => void
  ): () => void {
    return this.realtimePort.onParticipantsChanged(meetingCode, callback);
  }

  subscribeToMeetingStatus(
    meetingCode: string,
    callback: (meeting: Meeting) => void
  ): () => void {
    return this.realtimePort.onMeetingStatusChanged(meetingCode, callback);
  }

  async updateStatus(meetingCode: string, status: string): Promise<void> {
    await this.realtimePort.updateMeetingStatus(meetingCode, status);
  }
}
