import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Context } from 'telegraf';
import { ConversationHistoryService } from './conversation-history.service';
import { startConversationKeyboard } from '../markup-utils';
import { Users } from '../models/Users.model';

@Injectable()
export class CallbackQueryService {
  constructor(
    private conversationHistoryService: ConversationHistoryService,
    @InjectModel(Users)
    private userModel: typeof Users,
  ) {}

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

        // Update the user's history to create a new conversation ID
        this.conversationHistoryService.getOrCreateUser(userId).then((user) => {
          this.conversationHistoryService
            .createConversation(user, 'user', '')
            .then(({ conversationId }) => {
              this.userModel.update(
                { history: [...user.history, conversationId] },
                { where: { userId: user.userId } },
              );
            });
        });
      }

      ctx.answerCbQuery();
    }
  }

  async displayConversationArchive(ctx: Context, userId: number) {
    const user = await this.conversationHistoryService.getOrCreateUser(userId);
    const userConversationHistory =
      await this.conversationHistoryService.getConversationHistory(user);

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
