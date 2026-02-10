import type { Meeting } from '@/src/domain/entities/Meeting';
import type { MeetingRepository } from '@/src/domain/repositories/MeetingRepository';
import { openMeetingDB } from '../db/indexeddb';
import { MeetingMapper } from '../db/MeetingMapper';

export class IndexedDBMeetingRepository implements MeetingRepository {
  async save(meeting: Meeting): Promise<void> {
    const db = await openMeetingDB();
    await db.put('meetings', MeetingMapper.toRecord(meeting));
    db.close();
  }

  async findById(id: string): Promise<Meeting | null> {
    const db = await openMeetingDB();
    const record = await db.get('meetings', id);
    db.close();
    return record ? MeetingMapper.toDomain(record) : null;
  }

  async findAll(): Promise<Meeting[]> {
    const db = await openMeetingDB();
    const records = await db.getAll('meetings');
    db.close();
    return records.map(MeetingMapper.toDomain);
  }

  async findAllByUserId(userId: string): Promise<Meeting[]> {
    const db = await openMeetingDB();
    const records = await db.getAllFromIndex('meetings', 'by-user', userId);
    db.close();
    return records.map(MeetingMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    const db = await openMeetingDB();
    await db.delete('meetings', id);
    db.close();
  }

  async update(meeting: Meeting): Promise<void> {
    await this.save(meeting);
  }
}
