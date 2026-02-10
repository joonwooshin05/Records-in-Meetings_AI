import type { Language } from '@/src/domain/entities/Language';
import { Meeting } from '@/src/domain/entities/Meeting';
import type { MeetingRepository } from '@/src/domain/repositories/MeetingRepository';
import { v4 as uuidv4 } from 'uuid';

export class MeetingService {
  constructor(private readonly repository: MeetingRepository) {}

  async createMeeting(title: string, sourceLanguage: Language, targetLanguage: Language, userId?: string): Promise<Meeting> {
    const now = new Date();
    const meeting = new Meeting({
      id: uuidv4(),
      userId,
      title,
      createdAt: now,
      updatedAt: now,
      sourceLanguage,
      targetLanguage,
      transcripts: [],
      summary: null,
      status: 'idle',
    });

    await this.repository.save(meeting);
    return meeting;
  }

  async listMeetings(): Promise<Meeting[]> {
    const meetings = await this.repository.findAll();
    return meetings.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async listMeetingsByUser(userId: string): Promise<Meeting[]> {
    const meetings = await this.repository.findAllByUserId(userId);
    return meetings.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getMeeting(id: string): Promise<Meeting | null> {
    return this.repository.findById(id);
  }

  async saveMeeting(meeting: Meeting): Promise<void> {
    await this.repository.save(meeting);
  }

  async deleteMeeting(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
