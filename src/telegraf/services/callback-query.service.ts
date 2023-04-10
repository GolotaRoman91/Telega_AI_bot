import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { ConversationHistoryService } from './conversation-history.service';
import { startConversationKeyboard } from '../markup-utils';

@Injectable()
export class CallbackQueryService {
  constructor(private conversationHistoryService: ConversationHistoryService) {}

  handleCallbackQuery(ctx: Context, userStartedConversation: Set<number>) {
    if ('data' in ctx.callbackQuery) {
      const userId = ctx.callbackQuery.from.id;
      const data = ctx.callbackQuery.data;

      if (data === 'start_conversation') {
        userStartedConversation.add(userId);
        ctx.reply(
          'You have started a new conversation. You can now send messages.',
        );
      } else if (data === 'conversation_archive') {
        this.displayConversationArchive(ctx, userId);
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

  async displayConversationArchive(ctx: Context, userId: number) {
    const userConversationHistory =
      await this.conversationHistoryService.getOrCreateConversationHistory(
        userId,
      );

    const formattedHistory = userConversationHistory
      .map(
        (message) =>
          `${message.role === 'user' ? 'You' : 'AI Assistant'}: ${
            message.content
          }`,
      )
      .join('\n');

    ctx.reply(
      `Here is your conversation archive:\n\n${formattedHistory}`,
      startConversationKeyboard,
    );
  }
}
