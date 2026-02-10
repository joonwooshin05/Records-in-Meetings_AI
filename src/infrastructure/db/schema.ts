import type { DBSchema } from 'idb';
import type { Language } from '@/src/domain/entities/Language';
import type { MeetingStatus } from '@/src/domain/entities/Meeting';

export interface TranscriptRecord {
  id: string;
  text: string;
  timestamp: number;
  language: Language;
  isFinal: boolean;
  speaker?: string;
}

export interface TranslationRecord {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  transcriptId: string;
  createdAt: string;
}

export interface SummaryRecord {
  id: string;
  meetingId: string;
  keyPoints: string[];
  fullSummary: string;
  language: Language;
  createdAt: string;
}

export interface ParticipantRecord {
  userId: string;
  displayName: string;
  role: 'host' | 'participant';
  joinedAt: string;
  targetLanguage: Language;
}

export interface MeetingRecord {
  id: string;
  userId?: string;
  hostId?: string;
  meetingCode?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  transcripts: TranscriptRecord[];
  summary: SummaryRecord | null;
  status: MeetingStatus;
  participants?: ParticipantRecord[];
}

export interface MeetingDBSchema extends DBSchema {
  meetings: {
    key: string;
    value: MeetingRecord;
    indexes: { 'by-date': string; 'by-user': string };
  };
}
