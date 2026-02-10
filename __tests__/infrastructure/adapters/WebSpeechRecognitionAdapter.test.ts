import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSpeechRecognitionAdapter } from '@/src/infrastructure/adapters/WebSpeechRecognitionAdapter';

describe('WebSpeechRecognitionAdapter', () => {
  it('should report unsupported when SpeechRecognition is not available', () => {
    const adapter = new WebSpeechRecognitionAdapter();
    expect(adapter.isSupported()).toBe(false);
  });

  describe('when SpeechRecognition is available', () => {
    let mockRecognition: any;

    beforeEach(() => {
      mockRecognition = {
        start: vi.fn(),
        stop: vi.fn(),
        abort: vi.fn(),
        continuous: false,
        interimResults: false,
        lang: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      // Must use function (not arrow) so it can be called with `new`
      vi.stubGlobal('webkitSpeechRecognition', function () {
        return mockRecognition;
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should report supported', () => {
      const adapter = new WebSpeechRecognitionAdapter();
      expect(adapter.isSupported()).toBe(true);
    });

    it('should start recognition with correct language', () => {
      const adapter = new WebSpeechRecognitionAdapter();
      adapter.start('ko');
      expect(mockRecognition.lang).toBe('ko-KR');
      expect(mockRecognition.continuous).toBe(true);
      expect(mockRecognition.interimResults).toBe(true);
      expect(mockRecognition.start).toHaveBeenCalled();
    });

    it('should map language codes to BCP47', () => {
      const adapter = new WebSpeechRecognitionAdapter();

      adapter.start('en');
      expect(mockRecognition.lang).toBe('en-US');

      adapter.start('ja');
      expect(mockRecognition.lang).toBe('ja-JP');

      adapter.start('zh');
      expect(mockRecognition.lang).toBe('zh-CN');
    });

    it('should stop recognition', () => {
      const adapter = new WebSpeechRecognitionAdapter();
      adapter.start('en');
      adapter.stop();
      expect(mockRecognition.stop).toHaveBeenCalled();
    });
  });
});
