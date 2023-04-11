import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { OpenAiService } from './openai.service';
import { ConversationHistoryService } from './conversation-history.service';
import {
  endConversationKeyboard,
  startConversationKeyboard,
} from '../markup-utils';
import { Message } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class MessageHandlerService {
  constructor(
    private openAiService: OpenAiService,
    private conversationHistoryService: ConversationHistoryService,
  ) {}

  async handleTextMessage(
    ctx: Context,
    userId: number,
    userStartedConversation: Set<number>,
  ) {
    const message = ctx.message as Message.TextMessage;

    if (!message) return;

    const content = message.text;

    if (!content) return;

    if (!userStartedConversation.has(userId)) {
      ctx.reply(
        'Please select an action to proceed.',
        startConversationKeyboard,
      );
      return;
    }

    const user = await this.conversationHistoryService.getOrCreateUser(userId);
    const userConversationHistory =
      await this.conversationHistoryService.getConversationHistory(user);

    userConversationHistory.push({ role: 'user', content });
    const response = await this.openAiService.getResponse(
      userConversationHistory,
    );
    userConversationHistory.push({ role: 'assistant', content: response });

    // Store the conversation ID when a new conversation is created
    const { conversation, conversationId } =
      await this.conversationHistoryService.createConversation(
        user,
        'assistant',
        response,
      );

    ctx.reply(response, endConversationKeyboard);
  }
}
