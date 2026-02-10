import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { IndexedDBMeetingRepository } from '@/src/infrastructure/repositories/IndexedDBMeetingRepository';
import { Meeting } from '@/src/domain/entities/Meeting';
import { Transcript } from '@/src/domain/entities/Transcript';
import { Summary } from '@/src/domain/entities/Summary';

function createTestMeeting(overrides?: Partial<{ id: string; title: string }>) {
  return new Meeting({
    id: overrides?.id ?? 'm-1',
    title: overrides?.title ?? 'Test Meeting',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    sourceLanguage: 'en',
    targetLanguage: 'ko',
    transcripts: [],
    summary: null,
    status: 'idle',
  });
}

describe('IndexedDBMeetingRepository', () => {
  let repo: IndexedDBMeetingRepository;

  beforeEach(() => {
    repo = new IndexedDBMeetingRepository();
  });

  it('should save and retrieve a meeting', async () => {
    const meeting = createTestMeeting({ id: 'save-1', title: 'Save Test' });
    await repo.save(meeting);
    const result = await repo.findById('save-1');
    expect(result).not.toBeNull();
    expect(result!.title).toBe('Save Test');
    expect(result!.id).toBe('save-1');
  });

  it('should return null for non-existent meeting', async () => {
    const result = await repo.findById('nonexistent');
    expect(result).toBeNull();
  });

  it('should list all meetings', async () => {
    await repo.save(createTestMeeting({ id: 'list-1' }));
    await repo.save(createTestMeeting({ id: 'list-2' }));
    const all = await repo.findAll();
    expect(all.length).toBeGreaterThanOrEqual(2);
  });

  it('should delete a meeting', async () => {
    await repo.save(createTestMeeting({ id: 'del-1' }));
    await repo.delete('del-1');
    const result = await repo.findById('del-1');
    expect(result).toBeNull();
  });

  it('should update a meeting', async () => {
    const meeting = createTestMeeting({ id: 'upd-1', title: 'Original' });
    await repo.save(meeting);

    const updated = new Meeting({
      ...meeting.toProps(),
      title: 'Updated',
    });
    await repo.update(updated);

    const result = await repo.findById('upd-1');
    expect(result!.title).toBe('Updated');
  });

  it('should persist meeting with transcripts', async () => {
    const meeting = createTestMeeting({ id: 'tr-1' }).start();
    const withTranscript = meeting.addTranscript(
      new Transcript({
        id: 'transcript-1',
        text: 'Hello world',
        timestamp: 1000,
        language: 'en',
        isFinal: true,
      })
    );

    await repo.save(withTranscript);
    const result = await repo.findById('tr-1');
    expect(result!.transcriptCount).toBe(1);
    expect(result!.transcripts[0].text).toBe('Hello world');
  });

  it('should persist meeting with summary', async () => {
    const meeting = createTestMeeting({ id: 'sum-1' }).start().complete();
    const withSummary = meeting.setSummary(
      new Summary({
        id: 's-1',
        meetingId: 'sum-1',
        keyPoints: ['Point 1', 'Point 2'],
        fullSummary: 'Full summary',
        language: 'en',
        createdAt: new Date('2026-01-01'),
      })
    );

    await repo.save(withSummary);
    const result = await repo.findById('sum-1');
    expect(result!.summary).not.toBeNull();
    expect(result!.summary!.keyPointCount).toBe(2);
  });
});
