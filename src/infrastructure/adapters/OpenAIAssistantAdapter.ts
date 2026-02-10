import type { AIAssistantPort } from '@/src/domain/ports/AIAssistantPort';

export class OpenAIAssistantAdapter implements AIAssistantPort {
  async askQuestion(question: string, context?: string): Promise<string> {
    const response = await fetch('/api/ai-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error ?? 'Failed to get AI response');
    }

    const data = await response.json();
    return data.answer;
  }
}
