import type { Meeting } from '../entities/Meeting';

export interface MeetingRepository {
  save(meeting: Meeting): Promise<void>;
  findById(id: string): Promise<Meeting | null>;
  findAll(): Promise<Meeting[]>;
  findAllByUserId(userId: string): Promise<Meeting[]>;
  delete(id: string): Promise<void>;
  update(meeting: Meeting): Promise<void>;
}
