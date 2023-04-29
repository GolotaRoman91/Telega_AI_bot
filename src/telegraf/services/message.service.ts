import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Message } from '../models/message.model';
import {
  endConversationKeyboard,
  startConversationKeyboard,
} from '../markup-utils';
import { Context } from 'telegraf';
import { ConversationService } from './conversation.service';
import { OpenAiService } from './openai.service';

@Injectable()
export class MessageService {
  constructor(
    private conversationService: ConversationService,
    @Inject(forwardRef(() => OpenAiService))
    private openAiService: OpenAiService,
  ) {}

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

  async processTextMessage(
    ctx: Context,
    userId: number,
    userStartedConversation: Set<number>,
  ) {
    if (!this.isUserInConversation(userId, userStartedConversation)) {
      this.promptUserToStartConversation(ctx);
      return;
    }

    const conversationId = await this.conversationService.getConversationId(
      userId,
    );

    if (conversationId !== null) {
      if ('text' in ctx.message) {
        await this.processUserMessage(ctx, conversationId, ctx.message.text);
      } else {
        console.warn('Unexpected message type received');
      }
    }
  }

  isUserInConversation(
    userId: number,
    userStartedConversation: Set<number>,
  ): boolean {
    return userStartedConversation.has(userId);
  }

  promptUserToStartConversation(ctx: Context) {
    ctx.reply('Please select an action to proceed.', startConversationKeyboard);
  }

  async processUserMessage(
    ctx: Context,
    conversationId: number,
    messageText: string,
  ) {
    await this.createUserMessage(conversationId, messageText);

    const conversationHistory =
      await this.conversationService.getConversationHistory(conversationId);

    const formattedHistory = conversationHistory.map((msg) => ({
      role: msg.sender,
      content: msg.content,
    }));

    const botResponse = await this.openAiService.getResponse(
      conversationId,
      formattedHistory,
      '',
    );

    ctx.reply(botResponse, endConversationKeyboard);
  }
}
