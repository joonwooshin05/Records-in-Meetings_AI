import { openDB, type IDBPDatabase } from 'idb';
import type { MeetingDBSchema } from './schema';

export async function openMeetingDB(): Promise<IDBPDatabase<MeetingDBSchema>> {
  return openDB<MeetingDBSchema>('meeting-ai-db', 2, {
    upgrade(db, oldVersion, _newVersion, transaction) {
      if (oldVersion < 1) {
        const store = db.createObjectStore('meetings', { keyPath: 'id' });
        store.createIndex('by-date', 'updatedAt');
        store.createIndex('by-user', 'userId');
      }
      if (oldVersion >= 1 && oldVersion < 2) {
        const store = transaction.objectStore('meetings');
        store.createIndex('by-user', 'userId');
      }
    },
  });
}
