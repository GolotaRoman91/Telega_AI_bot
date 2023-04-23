import { ConversationService } from './conversation.service';
import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import {
  endConversationKeyboard,
  startConversationKeyboard,
} from '../markup-utils';

@Injectable()
export class CallbackQueryService {
  constructor(private conversationService: ConversationService) {}

  handleCallbackQuery(ctx: Context, userStartedConversation: Set<number>) {
    if ('data' in ctx.callbackQuery) {
      const data = ctx.callbackQuery.data;
      const userId = ctx.callbackQuery.from.id;

      if (data === 'start_conversation') {
        this.startConversationHandler(ctx, userId, userStartedConversation);
      } else if (data === 'end_conversation') {
        this.endConversationHandler(ctx, userId, userStartedConversation);
      }

      ctx.answerCbQuery();
    }
  }

  private startConversationHandler(
    ctx: Context,
    userId: number,
    userStartedConversation: Set<number>,
  ) {
    userStartedConversation.add(userId);
    this.conversationService.startConversation(userId);
    ctx.reply(
      'You have started a new conversation. You can now send messages.',
      endConversationKeyboard,
    );
  }

  private endConversationHandler(
    ctx: Context,
    userId: number,
    userStartedConversation: Set<number>,
  ) {
    userStartedConversation.delete(userId);
    ctx.reply(
      'Conversation has ended. Please select an action to proceed.',
      startConversationKeyboard,
    );
  }
}
