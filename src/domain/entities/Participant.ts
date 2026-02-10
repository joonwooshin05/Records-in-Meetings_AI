import type { Language } from './Language';

export type ParticipantRole = 'host' | 'participant';

export interface ParticipantProps {
  userId: string;
  displayName: string;
  role: ParticipantRole;
  joinedAt: Date;
  targetLanguage: Language;
}

export class Participant {
  readonly userId: string;
  readonly displayName: string;
  readonly role: ParticipantRole;
  readonly joinedAt: Date;
  readonly targetLanguage: Language;

  constructor(props: ParticipantProps) {
    if (!props.userId) throw new Error('Participant userId cannot be empty');
    this.userId = props.userId;
    this.displayName = props.displayName;
    this.role = props.role;
    this.joinedAt = props.joinedAt;
    this.targetLanguage = props.targetLanguage;
  }

  get isHost(): boolean {
    return this.role === 'host';
  }
}
