import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import {
  endConversationKeyboard,
  startConversationKeyboard,
} from '../markup-utils';

@Injectable()
export class CallbackQueryService {
  handleCallbackQuery(ctx: Context) {
    if ('data' in ctx.callbackQuery) {
      const data = ctx.callbackQuery.data;

      if (data === 'start_conversation') {
        ctx.reply(
          'You have started a new conversation. You can now send messages.',
          endConversationKeyboard,
        );
      } else if (data === 'end_conversation') {
        ctx.reply(
          'Conversation has ended. Please select an action to proceed.',
          startConversationKeyboard,
        );
      }

      ctx.answerCbQuery();
    }
  }
}
