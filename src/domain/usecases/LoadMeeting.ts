import type { Meeting } from '../entities/Meeting';
import type { MeetingRepository } from '../repositories/MeetingRepository';
import type { UseCase } from './UseCase';

export class LoadMeeting implements UseCase<string, Meeting | null> {
  constructor(private readonly repository: MeetingRepository) {}

  async execute(id: string): Promise<Meeting | null> {
    return this.repository.findById(id);
  }
}
