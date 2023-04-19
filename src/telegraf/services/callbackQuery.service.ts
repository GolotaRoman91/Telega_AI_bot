import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import {
  endConversationKeyboard,
  startConversationKeyboard,
} from '../markup-utils';

@Injectable()
export class CallbackQueryService {
  handleCallbackQuery(ctx: Context, userStartedConversation: Set<number>) {
    if ('data' in ctx.callbackQuery) {
      const data = ctx.callbackQuery.data;
      const userId = ctx.callbackQuery.from.id;

      if (data === 'start_conversation') {
        userStartedConversation.add(userId);
        ctx.reply(
          'You have started a new conversation. You can now send messages.',
          endConversationKeyboard,
        );
      } else if (data === 'end_conversation') {
        userStartedConversation.delete(userId);
        ctx.reply(
          'Conversation has ended. Please select an action to proceed.',
          startConversationKeyboard,
        );
      }

      ctx.answerCbQuery();
    }
  }
}
