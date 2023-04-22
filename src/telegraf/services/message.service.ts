import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from '../models/message.model';
import { startConversationKeyboard } from '../markup-utils';

@Injectable()
export class MessageService {
  constructor(@InjectModel(Message) private messageModel: typeof Message) {}

  async createUserMessage(
    conversationId: number,
    content: string,
  ): Promise<Message> {
    const message = new Message({
      conversationId,
      content,
      sender: 'user',
      timestamp: new Date(),
    });

    await message.save();
    return message;
  }

  async createBotMessage(
    conversationId: number,
    content: string,
  ): Promise<Message> {
    const message = new Message({
      conversationId,
      content,
      sender: 'assistant',
      timestamp: new Date(),
    });

    await message.save();
    return message;
  }

  async handleTextMessage(ctx, userId, userStartedConversation) {
    console.log(ctx);
    if (!userStartedConversation.has(userId)) {
      ctx.reply(
        'Please select an action to proceed.',
        startConversationKeyboard,
      );
      return;
    }
  }
}
