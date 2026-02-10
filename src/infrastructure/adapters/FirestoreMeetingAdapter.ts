import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import type { RealtimeMeetingPort } from '@/src/domain/ports/RealtimeMeetingPort';
import { Meeting } from '@/src/domain/entities/Meeting';
import { Transcript } from '@/src/domain/entities/Transcript';
import { Participant } from '@/src/domain/entities/Participant';
import type { Language } from '@/src/domain/entities/Language';
import type { MeetingStatus } from '@/src/domain/entities/Meeting';

export class FirestoreMeetingAdapter implements RealtimeMeetingPort {
  constructor(private readonly db: Firestore) {}

  async createRoom(meeting: Meeting): Promise<void> {
    const code = meeting.meetingCode!;
    await setDoc(doc(this.db, 'meetings', code), {
      id: meeting.id,
      hostId: meeting.hostId,
      title: meeting.title,
      meetingCode: code,
      sourceLanguage: meeting.sourceLanguage,
      targetLanguage: meeting.targetLanguage,
      status: meeting.status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (meeting.participants.length > 0) {
      const host = meeting.participants[0];
      await setDoc(doc(this.db, 'meetings', code, 'participants', host.userId), {
        userId: host.userId,
        displayName: host.displayName,
        role: host.role,
        joinedAt: serverTimestamp(),
        targetLanguage: host.targetLanguage,
      });
    }
  }

  async joinRoom(meetingCode: string, participant: Participant): Promise<Meeting | null> {
    const meetingRef = doc(this.db, 'meetings', meetingCode);
    const snap = await getDoc(meetingRef);
    if (!snap.exists()) return null;

    await setDoc(doc(this.db, 'meetings', meetingCode, 'participants', participant.userId), {
      userId: participant.userId,
      displayName: participant.displayName,
      role: participant.role,
      joinedAt: serverTimestamp(),
      targetLanguage: participant.targetLanguage,
    });

    const data = snap.data();
    return new Meeting({
      id: data.id,
      hostId: data.hostId,
      meetingCode: data.meetingCode,
      title: data.title,
      sourceLanguage: data.sourceLanguage as Language,
      targetLanguage: data.targetLanguage as Language,
      status: data.status as MeetingStatus,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
      transcripts: [],
      summary: null,
    });
  }

  async leaveRoom(meetingCode: string, userId: string): Promise<void> {
    await deleteDoc(doc(this.db, 'meetings', meetingCode, 'participants', userId));
  }

  async findRoomByCode(meetingCode: string): Promise<Meeting | null> {
    const snap = await getDoc(doc(this.db, 'meetings', meetingCode));
    if (!snap.exists()) return null;

    const data = snap.data();
    return new Meeting({
      id: data.id,
      hostId: data.hostId,
      meetingCode: data.meetingCode,
      title: data.title,
      sourceLanguage: data.sourceLanguage as Language,
      targetLanguage: data.targetLanguage as Language,
      status: data.status as MeetingStatus,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
      transcripts: [],
      summary: null,
    });
  }

  async pushTranscript(meetingCode: string, transcript: Transcript): Promise<void> {
    await setDoc(doc(this.db, 'meetings', meetingCode, 'transcripts', transcript.id), {
      id: transcript.id,
      text: transcript.text,
      timestamp: transcript.timestamp,
      language: transcript.language,
      isFinal: transcript.isFinal,
      speaker: transcript.speaker ?? null,
      createdAt: serverTimestamp(),
    });
  }

  onTranscriptsChanged(
    meetingCode: string,
    callback: (transcripts: Transcript[]) => void
  ): () => void {
    const q = query(
      collection(this.db, 'meetings', meetingCode, 'transcripts'),
      orderBy('timestamp')
    );
    return onSnapshot(q, (snapshot) => {
      const transcripts = snapshot.docs.map((d) => {
        const data = d.data();
        return new Transcript({
          id: data.id,
          text: data.text,
          timestamp: data.timestamp,
          language: data.language as Language,
          isFinal: data.isFinal,
          speaker: data.speaker ?? undefined,
        });
      });
      callback(transcripts);
    });
  }

  onParticipantsChanged(
    meetingCode: string,
    callback: (participants: Participant[]) => void
  ): () => void {
    return onSnapshot(
      collection(this.db, 'meetings', meetingCode, 'participants'),
      (snapshot) => {
        const participants = snapshot.docs.map((d) => {
          const data = d.data();
          return new Participant({
            userId: data.userId,
            displayName: data.displayName,
            role: data.role,
            joinedAt: data.joinedAt?.toDate?.() ?? new Date(),
            targetLanguage: data.targetLanguage as Language,
          });
        });
        callback(participants);
      }
    );
  }

  async updateMeetingStatus(meetingCode: string, status: string): Promise<void> {
    await setDoc(
      doc(this.db, 'meetings', meetingCode),
      { status, updatedAt: serverTimestamp() },
      { merge: true }
    );
  }

  onMeetingStatusChanged(
    meetingCode: string,
    callback: (meeting: Meeting) => void
  ): () => void {
    return onSnapshot(doc(this.db, 'meetings', meetingCode), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      callback(
        new Meeting({
          id: data.id,
          hostId: data.hostId,
          meetingCode: data.meetingCode,
          title: data.title,
          sourceLanguage: data.sourceLanguage as Language,
          targetLanguage: data.targetLanguage as Language,
          status: data.status as MeetingStatus,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
          transcripts: [],
          summary: null,
        })
      );
    });
  }
}
