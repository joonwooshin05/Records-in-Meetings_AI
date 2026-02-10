import type { Meeting } from '../entities/Meeting';
import type { MeetingRepository } from '../repositories/MeetingRepository';
import type { UseCase } from './UseCase';

export class SaveMeeting implements UseCase<Meeting, void> {
  constructor(private readonly repository: MeetingRepository) {}

  async execute(meeting: Meeting): Promise<void> {
    await this.repository.save(meeting);
  }
}
