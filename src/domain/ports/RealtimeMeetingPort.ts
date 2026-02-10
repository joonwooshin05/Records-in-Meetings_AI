import type { Meeting } from '../entities/Meeting';
import type { Transcript } from '../entities/Transcript';
import type { Participant } from '../entities/Participant';

export interface RealtimeMeetingPort {
  createRoom(meeting: Meeting): Promise<void>;
  joinRoom(meetingCode: string, participant: Participant): Promise<Meeting | null>;
  leaveRoom(meetingCode: string, userId: string): Promise<void>;
  findRoomByCode(meetingCode: string): Promise<Meeting | null>;

  pushTranscript(meetingCode: string, transcript: Transcript): Promise<void>;
  onTranscriptsChanged(
    meetingCode: string,
    callback: (transcripts: Transcript[]) => void
  ): () => void;

  onParticipantsChanged(
    meetingCode: string,
    callback: (participants: Participant[]) => void
  ): () => void;

  updateMeetingStatus(meetingCode: string, status: string): Promise<void>;
  onMeetingStatusChanged(
    meetingCode: string,
    callback: (meeting: Meeting) => void
  ): () => void;
}
