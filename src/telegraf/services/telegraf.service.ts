import { Injectable } from '@nestjs/common';
import { Telegraf, Context } from 'telegraf';
import { postConversationKeyboard } from '../markup-utils';
import { UserService } from './user.service';
import { CallbackQueryService } from './callbackQuery.service';
import { MessageService } from './message.service';
import { VoiceMessageService } from './voiceMessage.service';

@Injectable()
export class TelegrafService {
  private bot: Telegraf<Context>;
  private userStartedConversation: Set<number>;

  constructor(
    private callbackQueryService: CallbackQueryService,
    private userService: UserService,
    private messageService: MessageService,
    private voiceMessageService: VoiceMessageService,
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
    this.bot.on('voice', async (ctx) => await this.handleVoiceMessage(ctx));
  }

  private async handleStartCommand(ctx: Context) {
    const telegramId = ctx.from.id;
    await this.userService.findOrCreateUser(telegramId);
    const welcomeMessage = `Welcome to the AI Assistant bot! 😊 I'm here to help you with any questions or concerns you may have. Feel free to ask me anything, and I'll do my best to assist you! You can send me text or voice messages!`;
    ctx.reply(welcomeMessage, postConversationKeyboard);
  }

  private handleCallbackQuery(ctx: Context) {
    this.callbackQueryService.handleCallbackQuery(
      ctx,
      this.userStartedConversation,
    );
  }

  private async handleTextMessage(ctx: Context) {
    const userId = ctx.message?.from?.id;
    if (userId) {
      await this.messageService.processTextMessage(
        ctx,
        userId,
        this.userStartedConversation,
      );
    }
  }

  private async handleVoiceMessage(ctx: Context) {
    const userId = ctx.message?.from?.id;
    if (userId) {
      await this.voiceMessageService.handleVoiceMessage(
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
