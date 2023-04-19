import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from '../models/message.model';
import { startConversationKeyboard } from '../markup-utils';

@Injectable()
export class MessageService {
  constructor(@InjectModel(Message) private messageModel: typeof Message) {}

  async createMessage(
    conversationId: number,
    content: string,
    sender: 'user' | 'bot',
  ): Promise<Message> {
    return await this.messageModel.create({
      conversationId,
      content,
      sender,
      timestamp: new Date(),
    });
  }

  async handleTextMessage(ctx, userId, userStartedConversation) {
    if (!userStartedConversation.has(userId)) {
      ctx.reply(
        'Please select an action to proceed.',
        startConversationKeyboard,
      );
      return;
    }
  }
}
