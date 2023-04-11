import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from '../models/Users.model';
import { Conversation } from '../models/Conversation.model';

@Injectable()
export class ConversationHistoryService {
  constructor(
    @InjectModel(Users)
    private userModel: typeof Users,
    @InjectModel(Conversation)
    private conversationModel: typeof Conversation,
  ) {}

  async getOrCreateUser(userId: number) {
    try {
      const [user, created] = await this.userModel.findOrCreate({
        where: { userId },
        defaults: { userId, history: [] },
      });

      return user;
    } catch (error) {
      console.error('Error in getOrCreateUser:', error);
      throw error;
    }
  }

  async getConversationHistory(user: Users) {
    try {
      const conversations = await this.conversationModel.findAll({
        where: { userId: user.userId },
      });

      return conversations.map((conversation) => ({
        role: conversation.user.userId === user.userId ? 'user' : 'assistant',
        content: conversation.history,
      }));
    } catch (error) {
      console.error('Error in getConversationHistory:', error);
      throw error;
    }
  }

  async createConversation(user: Users, role: string, content: string) {
    try {
      const conversation = await this.conversationModel.create({
        userId: user.userId,
        history: content,
      });

      await this.userModel.update(
        { history: [...user.history, conversation.id] },
        { where: { userId: user.userId } },
      );

      return { conversation, conversationId: conversation.id };
    } catch (error) {
      console.error('Error in createConversation:', error);
      throw error;
    }
  }
}
