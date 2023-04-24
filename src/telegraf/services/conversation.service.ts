import { Injectable } from '@nestjs/common';
import { Conversation } from '../models/conversation.model';
import { UserService } from './user.service';
import { Message } from '../models/message.model';

@Injectable()
export class ConversationService {
  constructor(private userService: UserService) {}

  async startConversation(telegramId: number): Promise<Conversation> {
    const user = await this.userService.findUserByTelegramId(telegramId);
    return await Conversation.create({ userId: user.id });
  }

  async getConversationId(telegramId: number): Promise<number | null> {
    const user = await this.userService.findUserByTelegramId(telegramId);

    if (!user) {
      return null;
    }

    const conversation = await Conversation.findOne({
      where: { userId: user.id },
      order: [['conversationId', 'DESC']],
    });

    if (!conversation) {
      return null;
    }

    return conversation.conversationId;
  }

  async getConversationHistory(conversationId: number): Promise<Message[]> {
    const conversation = await Conversation.findByPk(conversationId, {
      include: [Message],
    });

    return conversation.messages;
  }
}
