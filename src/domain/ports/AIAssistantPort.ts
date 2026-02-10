export interface AIAssistantPort {
  askQuestion(question: string, context?: string): Promise<string>;
}
