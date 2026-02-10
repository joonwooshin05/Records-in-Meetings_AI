import type { MeetingRepository } from '../repositories/MeetingRepository';
import type { UseCase } from './UseCase';

export class DeleteMeeting implements UseCase<string, void> {
  constructor(private readonly repository: MeetingRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
