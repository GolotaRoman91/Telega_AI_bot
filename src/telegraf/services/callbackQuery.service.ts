import { ConversationService } from './conversation.service';
import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import {
  endConversationKeyboard,
  postConversationKeyboard,
  startConversationKeyboard,
} from '../markup-utils';
import { OpenAiService } from './openai.service';

@Injectable()
export class CallbackQueryService {
  constructor(
    private conversationService: ConversationService,
    private openAiService: OpenAiService,
  ) {}

  handleCallbackQuery(ctx: Context, userStartedConversation: Set<number>) {
    if ('data' in ctx.callbackQuery) {
      const { data, from } = ctx.callbackQuery;
      const userId = from.id;

      const handlers = {
        start_conversation: () =>
          this.startConversationHandler(ctx, userId, userStartedConversation),
        end_conversation: () =>
          this.endConversationHandler(ctx, userId, userStartedConversation),
        archive_conversation: () => this.archiveConversationHandler(ctx),
      };

      handlers[data]?.();
      ctx.answerCbQuery();
    }
  }

  private async archiveConversationHandler(ctx: Context) {
    const telegramId = ctx.callbackQuery.from.id;

    try {
      const conversationIds =
        await this.conversationService.getConversationsByTelegramId(telegramId);
      console.log(conversationIds);

      // Split the conversationIds into chunks of max 2000 characters
      const maxMessageLength = 1000;
      const chunks = [];

      for (let i = 0; i < conversationIds.length; i += maxMessageLength) {
        chunks.push(conversationIds.slice(i, i + maxMessageLength));
      }

      // Send each chunk as a separate message
      for (const chunk of chunks) {
        await ctx.reply(
          `Here is a part of the conversation IDs for user ${telegramId}:\n${chunk}`,
        );
      }

      // Send the startConversationKeyboard after all chunks have been sent
      ctx.reply(
        'All conversation IDs have been sent.',
        startConversationKeyboard,
      );
    } catch (error) {
      console.error('Error fetching conversations:', error);
      ctx.reply(
        'There was an error fetching your conversations. Please try again later.',
      );
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

  private async endConversationHandler(
    ctx: Context,
    userId: number,
    userStartedConversation: Set<number>,
  ) {
    const conversationId = await this.conversationService.getConversationId(
      userId,
    );

    if (conversationId !== null) {
      const conversationHistory =
        await this.conversationService.getConversationHistory(conversationId);

      const formattedHistory = conversationHistory.map((msg) => ({
        role: msg.sender,
        content: msg.content,
      }));

      const conversationTopic = await this.openAiService.getResponse(
        conversationId,
        formattedHistory,
        'Come up with a title for the topic of this conversation',
      );

      await this.conversationService.updateConversationTopic(
        conversationId,
        conversationTopic,
      );
    }

    userStartedConversation.delete(userId);
    ctx.reply(
      'Conversation has ended. The conversation topic has been saved. Please select an action to proceed.',
      postConversationKeyboard,
    );
  }
}
