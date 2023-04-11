import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { ConversationHistoryService } from './conversation-history.service';
import { startConversationKeyboard } from '../markup-utils';

@Injectable()
export class CallbackQueryService {
  constructor(private conversationHistoryService: ConversationHistoryService) {}

  async handleCallbackQuery(
    ctx: Context,
    userStartedConversation: Set<number>,
  ) {
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
        const emptyConversationHistory = [];
        const serializedConversationHistory =
          this.conversationHistoryService.serializeHistory(
            emptyConversationHistory,
          );
        const currentConversation =
          await this.conversationHistoryService.createNewConversation(
            userId,
            serializedConversationHistory,
          );
        await this.conversationHistoryService.saveConversation(
          userId,
          this.conversationHistoryService.deserializeHistory(
            currentConversation.history,
          ),
        );
        ctx.reply(
          'Conversation has ended. Please select an action to proceed.',
          startConversationKeyboard,
        );
      }

      ctx.answerCbQuery();
    }
  }

  async displayConversationArchive(ctx: Context, userId: number) {
    const userConversations =
      await this.conversationHistoryService.getConversationsByUserId(userId);

    const formattedHistory = userConversations
      .map(
        (conversation, index) =>
          `Conversation ${index + 1}:\n` +
          conversation
            .map(
              (message) =>
                `${message.role === 'user' ? 'You' : 'AI Assistant'}: ${
                  message.content
                }`,
            )
            .join('\n'),
      )
      .join('\n\n');

    ctx.reply(
      `Here is your conversation archive:\n\n${formattedHistory}`,
      startConversationKeyboard,
    );
  }
}
