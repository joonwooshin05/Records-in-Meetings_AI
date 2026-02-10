import type { Language } from './Language';
import type { Transcript } from './Transcript';
import type { Summary } from './Summary';
import type { Participant } from './Participant';

export type MeetingStatus = 'idle' | 'recording' | 'paused' | 'completed';

const VALID_TRANSITIONS: Record<MeetingStatus, MeetingStatus[]> = {
  idle: ['recording'],
  recording: ['paused', 'completed'],
  paused: ['recording', 'completed'],
  completed: [],
};

export interface MeetingProps {
  id: string;
  userId?: string;
  hostId?: string;
  meetingCode?: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  sourceLanguage: Language;
  targetLanguage: Language;
  transcripts: Transcript[];
  summary: Summary | null;
  status: MeetingStatus;
  participants?: Participant[];
}

export class Meeting {
  readonly id: string;
  readonly userId?: string;
  readonly hostId?: string;
  readonly meetingCode?: string;
  readonly title: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly sourceLanguage: Language;
  readonly targetLanguage: Language;
  readonly transcripts: readonly Transcript[];
  readonly summary: Summary | null;
  readonly status: MeetingStatus;
  readonly participants: readonly Participant[];

  constructor(props: MeetingProps) {
    if (!props.title) throw new Error('Meeting title cannot be empty');

    this.id = props.id;
    this.userId = props.userId;
    this.hostId = props.hostId;
    this.meetingCode = props.meetingCode;
    this.title = props.title;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.sourceLanguage = props.sourceLanguage;
    this.targetLanguage = props.targetLanguage;
    this.transcripts = [...props.transcripts];
    this.summary = props.summary;
    this.status = props.status;
    this.participants = props.participants ? [...props.participants] : [];
  }

  private transition(to: MeetingStatus): Meeting {
    if (!VALID_TRANSITIONS[this.status].includes(to)) {
      throw new Error(`Invalid status transition: ${this.status} -> ${to}`);
    }
    return new Meeting({ ...this.toProps(), status: to, updatedAt: new Date() });
  }

  start(): Meeting {
    return this.transition('recording');
  }

  pause(): Meeting {
    return this.transition('paused');
  }

  complete(): Meeting {
    return this.transition('completed');
  }

  addTranscript(transcript: Transcript): Meeting {
    return new Meeting({
      ...this.toProps(),
      transcripts: [...this.transcripts, transcript],
      updatedAt: new Date(),
    });
  }

  setSummary(summary: Summary): Meeting {
    return new Meeting({
      ...this.toProps(),
      summary,
      updatedAt: new Date(),
    });
  }

  isHost(userId: string): boolean {
    return this.hostId === userId;
  }

  addParticipant(participant: Participant): Meeting {
    if (this.participants.some((p) => p.userId === participant.userId)) {
      return this;
    }
    return new Meeting({
      ...this.toProps(),
      participants: [...this.participants, participant],
      updatedAt: new Date(),
    });
  }

  removeParticipant(userId: string): Meeting {
    return new Meeting({
      ...this.toProps(),
      participants: this.participants.filter((p) => p.userId !== userId),
      updatedAt: new Date(),
    });
  }

  get participantCount(): number {
    return this.participants.length;
  }

  get transcriptCount(): number {
    return this.transcripts.length;
  }

  get duration(): number {
    if (this.transcripts.length === 0) return 0;
    const timestamps = this.transcripts.map((t) => t.timestamp);
    return Math.max(...timestamps) - Math.min(...timestamps);
  }

  toProps(): MeetingProps {
    return {
      id: this.id,
      userId: this.userId,
      hostId: this.hostId,
      meetingCode: this.meetingCode,
      title: this.title,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      sourceLanguage: this.sourceLanguage,
      targetLanguage: this.targetLanguage,
      transcripts: [...this.transcripts],
      summary: this.summary,
      status: this.status,
      participants: [...this.participants],
    };
  }
}
