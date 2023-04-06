import { Injectable } from '@nestjs/common';

@Injectable()
export class ConversationHistoryService {
  private conversationHistories: Map<
    number,
    Array<{ role: string; content: string }>
  > = new Map();

  getOrCreateConversationHistory(
    userId: number,
  ): Array<{ role: string; content: string }> {
    if (!this.conversationHistories.has(userId)) {
      this.conversationHistories.set(userId, [
        { role: 'system', content: 'You are a helpful assistant.' },
      ]);
    }

    return this.conversationHistories.get(userId);
  }
}
