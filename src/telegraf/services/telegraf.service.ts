import { OggConverterService } from './oggConverter.service';
import { Injectable } from '@nestjs/common';
import { Telegraf, Context } from 'telegraf';
import { postConversationKeyboard } from '../markup-utils';
import { UserService } from './user.service';
import { CallbackQueryService } from './callbackQuery.service';
import { MessageService } from './message.service';

@Injectable()
export class TelegrafService {
  private bot: Telegraf<Context>;
  private userStartedConversation: Set<number>;

  constructor(
    private callbackQueryService: CallbackQueryService,
    private userService: UserService,
    private messageHandlerService: MessageService,
    private oggConverterService: OggConverterService,
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

    const welcomeMessage = `Welcome to the AI Assistant bot! 😊 I'm here to help you with any questions or concerns you may have. Feel free to ask me anything, and I'll do my best to assist you!`;

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
      await this.messageHandlerService.processTextMessage(
        ctx,
        userId,
        this.userStartedConversation,
      );
    }
  }

  private async handleVoiceMessage(ctx: Context) {
    const userId = ctx.message?.from?.id;

    if (
      userId &&
      this.messageHandlerService.isUserInConversation(
        userId,
        this.userStartedConversation,
      )
    ) {
      const message = ctx.message as any;

      if (message.voice) {
        const link = await ctx.telegram.getFileLink(message.voice.file_id);
        const userIdString = String(userId);
        const oggPath = await this.oggConverterService.create(
          link.href,
          userIdString,
        );
        const mp3Path = await this.oggConverterService.toMp3(
          oggPath,
          userIdString,
        );
        await ctx.reply(mp3Path as string);
      }
    } else {
      this.messageHandlerService.promptUserToStartConversation(ctx);
    }
  }

  getBotInstance(): Telegraf<Context> {
    return this.bot;
  }
}
