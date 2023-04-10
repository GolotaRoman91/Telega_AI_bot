import { Injectable } from '@nestjs/common';
import { Telegraf, Context } from 'telegraf';
import { CallbackQueryService } from './callback-query.service';
import { MessageHandlerService } from './message-handler.service';
import { startConversationKeyboard } from '../markup-utils';

@Injectable()
export class TelegrafService {
  private bot: Telegraf<Context>;
  private userStartedConversation: Set<number>;

  constructor(
    private callbackQueryService: CallbackQueryService,
    private messageHandlerService: MessageHandlerService,
  ) {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.userStartedConversation = new Set();
    this.registerHandlers();
    this.bot.launch();
  }

  private registerHandlers() {
    this.bot.command('start', (ctx) => this.handleStartCommand(ctx));
    this.bot.command('echo', (ctx) => this.handleEchoCommand(ctx));
    this.bot.on('text', async (ctx) => await this.handleTextMessage(ctx));
    this.bot.on('callback_query', (ctx) => this.handleCallbackQuery(ctx));
  }

  private handleStartCommand(ctx) {
    const welcomeMessage = `Welcome to the AI Assistant bot! 😊 I'm here to help you with any questions or concerns you may have. Feel free to ask me anything, and I'll do my best to assist you!`;

    ctx.reply(welcomeMessage, startConversationKeyboard);
  }

  private handleCallbackQuery(ctx) {
    this.callbackQueryService.handleCallbackQuery(
      ctx,
      this.userStartedConversation,
    );
  }

  private handleEchoCommand(ctx) {
    const text = ctx.message.text;
    ctx.reply(text.replace('/echo', '').trim());
  }

  private async handleTextMessage(ctx) {
    const userId = ctx.message?.from?.id;
    if (userId) {
      this.messageHandlerService.handleTextMessage(
        ctx,
        userId,
        this.userStartedConversation,
      );
    }
  }

  getBotInstance(): Telegraf<Context> {
    return this.bot;
  }
}
