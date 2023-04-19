import { Injectable } from '@nestjs/common';
import { Telegraf, Context } from 'telegraf';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { startConversationKeyboard } from '../markup-utils';
import { UserService } from './user.service';

@Injectable()
export class TelegrafService {
  private bot: Telegraf<Context>;

  constructor(
    private conversationService: ConversationService,
    private messageService: MessageService,
    private userService: UserService,
  ) {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.registerHandlers();
    this.bot.launch();
  }

  private registerHandlers() {
    this.bot.command('start', (ctx) => this.handleStartCommand(ctx));
  }

  private async handleStartCommand(ctx: Context) {
    const telegramId = ctx.from.id;

    await this.userService.findOrCreateUser(telegramId);

    const welcomeMessage = `Welcome to the AI Assistant bot! 😊 I'm here to help you with any questions or concerns you may have. Feel free to ask me anything, and I'll do my best to assist you!`;

    ctx.reply(welcomeMessage, startConversationKeyboard);
  }

  getBotInstance(): Telegraf<Context> {
    return this.bot;
  }
}
