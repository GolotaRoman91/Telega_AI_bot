import { ConversationService } from './conversation.service';
import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import {
  endConversationKeyboard,
  postConversationKeyboard,
} from '../markup-utils';
import { Conversation } from '../models/conversation.model';

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
      } else if (data === 'archive_conversation') {
        this.archiveConversationHandler(ctx);
      }

      ctx.answerCbQuery();
    }
  }

  private async archiveConversationHandler(ctx: Context) {
    const userId = ctx.callbackQuery.from.id;

    try {
      const conversations = await Conversation.findAll({ where: { userId } });

      const conversationIds = conversations
        .map((conversation) => conversation.conversationId)
        .join(', ');

      ctx.reply(
        `Here is the list of conversation IDs for user ${userId}: ${conversationIds}`,
      );
    } catch (error) {
      console.error('Error fetching conversations:', error);
      ctx.reply(
        'An error occurred while fetching your conversations. Please try again later.',
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

  private endConversationHandler(
    ctx: Context,
    userId: number,
    userStartedConversation: Set<number>,
  ) {
    userStartedConversation.delete(userId);
    ctx.reply(
      'Conversation has ended. Please select an action to proceed.',
      postConversationKeyboard,
    );
  }
}
