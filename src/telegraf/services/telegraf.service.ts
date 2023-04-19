import { Injectable } from '@nestjs/common';
import { Telegraf, Context } from 'telegraf';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { User } from '../models/user.model';
import { startConversationKeyboard } from '../markup-utils';

@Injectable()
export class TelegrafService {
  private bot: Telegraf<Context>;

  constructor(
    private conversationService: ConversationService,
    private messageService: MessageService,
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

    const created = await User.findOrCreate({
      where: { telegramId },
      defaults: { telegramId },
    });

    if (created) {
      console.log(`New user created with telegramId: ${telegramId}`);
    } else {
      console.log(`User with telegramId: ${telegramId} already exists`);
    }

    const welcomeMessage = `Welcome to the AI Assistant bot! 😊 I'm here to help you with any questions or concerns you may have. Feel free to ask me anything, and I'll do my best to assist you!`;

    ctx.reply(welcomeMessage, startConversationKeyboard);
  }

  getBotInstance(): Telegraf<Context> {
    return this.bot;
  }
}
