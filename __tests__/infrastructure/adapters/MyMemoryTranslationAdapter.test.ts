import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MyMemoryTranslationAdapter } from '@/src/infrastructure/adapters/MyMemoryTranslationAdapter';

describe('MyMemoryTranslationAdapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should call MyMemory API and return Translation entity', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        responseData: { translatedText: '안녕하세요' },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const adapter = new MyMemoryTranslationAdapter();
    const result = await adapter.translate('Hello', 'en', 'ko', 'tr-1');

    expect(result.translatedText).toBe('안녕하세요');
    expect(result.sourceText).toBe('Hello');
    expect(result.sourceLanguage).toBe('en');
    expect(result.targetLanguage).toBe('ko');
    expect(result.transcriptId).toBe('tr-1');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('api.mymemory.translated.net/get?q=Hello&langpair=en|ko')
    );
  });

  it('should map zh to zh-CN for language code', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        responseData: { translatedText: '你好' },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const adapter = new MyMemoryTranslationAdapter();
    await adapter.translate('Hello', 'en', 'zh', 'tr-1');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('langpair=en|zh-CN')
    );
  });

  it('should throw on API error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    vi.stubGlobal('fetch', mockFetch);

    const adapter = new MyMemoryTranslationAdapter();
    await expect(adapter.translate('Hello', 'en', 'ko', 'tr-1')).rejects.toThrow('Translation API error: 500');
  });

  it('should throw when no translation returned', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        responseData: { translatedText: '' },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const adapter = new MyMemoryTranslationAdapter();
    await expect(adapter.translate('Hello', 'en', 'ko', 'tr-1')).rejects.toThrow('No translation returned');
  });
});
