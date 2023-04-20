import { ConversationService } from './conversation.service';
import { Injectable } from '@nestjs/common';
import { Telegraf, Context } from 'telegraf';
import { startConversationKeyboard } from '../markup-utils';
import { UserService } from './user.service';
import { CallbackQueryService } from './callbackQuery.service';
import { MessageService } from './message.service';
import { Message } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class TelegrafService {
  private bot: Telegraf<Context>;
  private userStartedConversation: Set<number>;

  constructor(
    private callbackQueryService: CallbackQueryService,
    private userService: UserService,
    private messageHandlerService: MessageService,
    private conversationService: ConversationService,
  ) {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.registerHandlers();
    this.userStartedConversation = new Set();
    this.bot.launch();
  }

  private registerHandlers() {
    this.bot.command('start', (ctx) => this.handleStartCommand(ctx));
    this.bot.on('callback_query', (ctx) => this.handleCallbackQuery(ctx));
    this.bot.on('text', async (ctx) => await this.handleTextMessage(ctx));
  }

  private async handleStartCommand(ctx: Context) {
    const telegramId = ctx.from.id;

    await this.userService.findOrCreateUser(telegramId);

    const welcomeMessage = `Welcome to the AI Assistant bot! 😊 I'm here to help you with any questions or concerns you may have. Feel free to ask me anything, and I'll do my best to assist you!`;

    ctx.reply(welcomeMessage, startConversationKeyboard);
  }

  private handleCallbackQuery(ctx: Context) {
    this.callbackQueryService.handleCallbackQuery(
      ctx,
      this.userStartedConversation,
    );
  }

  private async handleTextMessage(ctx: Context) {
    const userId = ctx.message?.from?.id;
    const message = ctx.message as Message.TextMessage;

    if (userId) {
      const conversationId = await this.conversationService.getConversationId(
        userId,
      );

      if (conversationId !== null) {
        this.messageHandlerService.handleTextMessage(
          ctx,
          userId,
          this.userStartedConversation,
        );

        this.messageHandlerService.createUserMessage(
          conversationId,
          message.text,
        );
      }
    }
  }

  getBotInstance(): Telegraf<Context> {
    return this.bot;
  }
}
