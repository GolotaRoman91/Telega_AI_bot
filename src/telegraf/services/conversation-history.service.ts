import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/User.model';

@Injectable()
export class ConversationHistoryService {
  constructor(
    @InjectModel(User)
    private UserModel: typeof User,
  ) {}

  async getOrCreateConversationHistory(userId: number) {
    try {
      const [conversationHistory] = await this.UserModel.findOrCreate({
        where: { userId },
        defaults: {
          userId,
          history: this.serializeHistory([
            { role: 'system', content: 'You are a helpful assistant.' },
          ]),
        },
      });

      return this.deserializeHistory(conversationHistory.history);
    } catch (error) {
      console.error('Error in getOrCreateConversationHistory:', error);
      throw error;
    }
  }

  async updateConversationHistory(
    userId: number,
    updatedHistory: Array<{ role: string; content: string }>,
  ) {
    await this.UserModel.update(
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
