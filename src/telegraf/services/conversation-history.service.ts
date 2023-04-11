import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConversationHistory } from '../models/conversation-history.model';
import { Conversation } from '../models/conversation.model';

@Injectable()
export class ConversationHistoryService {
  constructor(
    @InjectModel(ConversationHistory)
    private readonly conversationHistoryModel: typeof ConversationHistory,
    @InjectModel(Conversation)
    private readonly conversationModel: typeof Conversation,
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

  async createNewConversation(userId: number) {
    try {
      const conversation = await this.conversationModel.create({
        userId,
        history: this.serializeHistory([
          { role: 'system', content: 'You are a helpful assistant.' },
        ]),
      });

      return this.deserializeHistory(conversation.history);
    } catch (error) {
      console.error('Error in createNewConversation:', error);
      throw error;
    }
  }

  async saveConversation(
    userId: number,
    conversation: Array<{ role: string; content: string }>,
  ) {
    try {
      await this.conversationModel.create({
        userId,
        history: this.serializeHistory(conversation),
      });
    } catch (error) {
      console.error('Error in saveConversation:', error);
      throw error;
    }
  }

  async getConversationsByUserId(userId: number) {
    try {
      const conversations = await this.conversationModel.findAll({
        where: { userId },
      });

      return conversations.map((conversation) =>
        this.deserializeHistory(conversation.history),
      );
    } catch (error) {
      console.error('Error in getConversationsByUserId:', error);
      throw error;
    }
  }
}
