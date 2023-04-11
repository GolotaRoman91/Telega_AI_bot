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

  serializeHistory(history: Array<{ role: string; content: string }>) {
    return JSON.stringify(history);
  }

  deserializeHistory(serializedHistory: string) {
    return JSON.parse(serializedHistory);
  }

  async createNewConversation(
    userId: number,
    history: string,
  ): Promise<Conversation> {
    // First, check if the user has a conversation history
    let conversationHistory = await this.conversationHistoryModel.findOne({
      where: { userId },
    });

    // If not, create a new conversation history entry for the user
    if (!conversationHistory) {
      conversationHistory = await this.conversationHistoryModel.create({
        userId,
        history,
      });
    } else {
      // If the user has a conversation history, update it
      await this.conversationHistoryModel.update(
        { history },
        { where: { userId } },
      );
    }

    // Then create a new conversation entry for the user
    const conversation = await this.conversationModel.create({
      userId,
      history,
    });
    return conversation;
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
