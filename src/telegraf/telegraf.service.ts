import { Injectable } from '@nestjs/common';
import { Telegraf, Context } from 'telegraf';
import { OpenAiService } from './openai.service';
import { ConversationHistoryService } from './conversation-history.service';

@Injectable()
export class TelegrafService {
  private bot: Telegraf<Context>;

  constructor(
    private openAiService: OpenAiService,
    private conversationHistoryService: ConversationHistoryService,
  ) {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.registerHandlers();
    this.bot.launch();
  }

  private registerHandlers() {
    this.bot.command('echo', (ctx) => this.handleEchoCommand(ctx));
    this.bot.on('text', async (ctx) => await this.handleTextMessage(ctx));
  }

  private handleEchoCommand(ctx) {
    const text = ctx.message.text;
    ctx.reply(text.replace('/echo', '').trim());
  }

  private async handleTextMessage(ctx) {
    const content = ctx.message?.text ?? '';
    const userId = ctx.message?.from?.id;

    if (!content || !userId) return;

    const userConversationHistory =
      await this.conversationHistoryService.getOrCreateConversationHistory(
        userId,
      );

    userConversationHistory.push({ role: 'user', content });
    const response = await this.openAiService.getResponse(
      userConversationHistory,
    );
    userConversationHistory.push({ role: 'assistant', content: response });

    await ctx.reply(response);
    await this.conversationHistoryService.updateConversationHistory(
      userId,
      userConversationHistory,
    );
  }

  getBotInstance(): Telegraf<Context> {
    return this.bot;
  }
}
