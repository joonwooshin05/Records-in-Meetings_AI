import type { Meeting } from '../entities/Meeting';
import type { MeetingRepository } from '../repositories/MeetingRepository';

export class ListMeetings {
  constructor(private readonly repository: MeetingRepository) {}

  async execute(): Promise<Meeting[]> {
    const meetings = await this.repository.findAll();
    return meetings.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
}
