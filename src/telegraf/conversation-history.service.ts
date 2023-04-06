import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConversationHistory } from './conversation-history.model';

@Injectable()
export class ConversationHistoryService {
  constructor(
    @InjectModel(ConversationHistory)
    private conversationHistoryModel: typeof ConversationHistory,
  ) {}

  async getOrCreateConversationHistory(userId: number) {
    try {
      const [conversationHistory, created] =
        await this.conversationHistoryModel.findOrCreate({
          where: { userId },
          defaults: {
            userId,
            history: this.serializeHistory([
              { role: 'system', content: 'You are a helpful assistant.' },
            ]),
          },
        });

      return created
        ? this.deserializeHistory(conversationHistory.history)
        : this.deserializeHistory(conversationHistory.history);
    } catch (error) {
      console.error('Error in getOrCreateConversationHistory:', error);
      throw error;
    }
  }

  async updateConversationHistory(
    userId: number,
    updatedHistory: Array<{ role: string; content: string }>,
  ) {
    await this.conversationHistoryModel.update(
      { history: this.serializeHistory(updatedHistory) },
      { where: { userId } },
    );
  }

  private serializeHistory(history: Array<{ role: string; content: string }>) {
    return JSON.stringify(history);
  }

  private deserializeHistory(serializedHistory: string) {
    return JSON.parse(serializedHistory);
  }
}
