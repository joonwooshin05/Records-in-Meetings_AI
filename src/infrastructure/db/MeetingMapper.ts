import { Meeting } from '@/src/domain/entities/Meeting';
import { Transcript } from '@/src/domain/entities/Transcript';
import { Summary } from '@/src/domain/entities/Summary';
import { Participant } from '@/src/domain/entities/Participant';
import type { MeetingRecord, TranscriptRecord, SummaryRecord } from './schema';

export class MeetingMapper {
  static toDomain(record: MeetingRecord): Meeting {
    const transcripts = record.transcripts.map(
      (t: TranscriptRecord) =>
        new Transcript({
          id: t.id,
          text: t.text,
          timestamp: t.timestamp,
          language: t.language,
          isFinal: t.isFinal,
          speaker: t.speaker,
        })
    );

    const summary = record.summary
      ? new Summary({
          id: record.summary.id,
          meetingId: record.summary.meetingId,
          keyPoints: record.summary.keyPoints,
          fullSummary: record.summary.fullSummary,
          language: record.summary.language,
          createdAt: new Date(record.summary.createdAt),
        })
      : null;

    const participants = (record.participants ?? []).map(
      (p) =>
        new Participant({
          userId: p.userId,
          displayName: p.displayName,
          role: p.role,
          joinedAt: new Date(p.joinedAt),
          targetLanguage: p.targetLanguage,
        })
    );

    return new Meeting({
      id: record.id,
      userId: record.userId,
      hostId: record.hostId,
      meetingCode: record.meetingCode,
      title: record.title,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
      sourceLanguage: record.sourceLanguage,
      targetLanguage: record.targetLanguage,
      transcripts,
      summary,
      status: record.status,
      participants,
    });
  }

  static toRecord(meeting: Meeting): MeetingRecord {
    return {
      id: meeting.id,
      userId: meeting.userId,
      hostId: meeting.hostId,
      meetingCode: meeting.meetingCode,
      title: meeting.title,
      createdAt: meeting.createdAt.toISOString(),
      updatedAt: meeting.updatedAt.toISOString(),
      sourceLanguage: meeting.sourceLanguage,
      targetLanguage: meeting.targetLanguage,
      transcripts: meeting.transcripts.map((t) => ({
        id: t.id,
        text: t.text,
        timestamp: t.timestamp,
        language: t.language,
        isFinal: t.isFinal,
        speaker: t.speaker,
      })),
      summary: meeting.summary
        ? {
            id: meeting.summary.id,
            meetingId: meeting.summary.meetingId,
            keyPoints: [...meeting.summary.keyPoints],
            fullSummary: meeting.summary.fullSummary,
            language: meeting.summary.language,
            createdAt: meeting.summary.createdAt.toISOString(),
          }
        : null,
      status: meeting.status,
      participants: meeting.participants.map((p) => ({
        userId: p.userId,
        displayName: p.displayName,
        role: p.role,
        joinedAt: p.joinedAt.toISOString(),
        targetLanguage: p.targetLanguage,
      })),
    };
  }
}
