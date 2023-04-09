import { Injectable } from '@nestjs/common';
import { Telegraf, Context, Markup } from 'telegraf';
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
    this.bot.command('start', (ctx) => this.handleStartCommand(ctx));
    this.bot.command('echo', (ctx) => this.handleEchoCommand(ctx));
    this.bot.command('start_dialog', (ctx) =>
      this.handleStartDialogCommand(ctx),
    );
    this.bot.on('text', async (ctx) => await this.handleTextMessage(ctx));
    this.bot.on(
      'callback_query',
      async (ctx) => await this.handleCallbackQuery(ctx),
    );
  }

  private handleStartDialogCommand(ctx) {
    const userId = ctx.message?.from?.id;

    if (!userId) return;

    const inlineKeyboard = Markup.inlineKeyboard([
      Markup.button.callback('End Dialog', 'end_dialog'),
    ]);

    ctx.reply(
      `Welcome to the dialog! Feel free to ask me anything. Click the button below to end the dialog and archive it.`,
      inlineKeyboard,
    );
  }

  private async handleCallbackQuery(ctx) {
    const userId = ctx.update.callback_query?.from?.id;

    if (!userId) return;

    const data = ctx.update.callback_query.data;

    if (data === 'start_dialog') {
      ctx.deleteMessage();
      this.handleStartDialogCommand(ctx);
    } else if (data === 'end_dialog') {
      const userConversationHistory =
        await this.conversationHistoryService.getOrCreateConversationHistory(
          userId,
        );

      await this.conversationHistoryService.archiveConversationHistory(
        userId,
        userConversationHistory,
      );

      ctx.answerCbQuery('Dialog archived!');
    }
  }

  private handleStartCommand(ctx) {
    const userId = ctx.message?.from?.id;

    if (!userId) return;

    const inlineKeyboard = Markup.inlineKeyboard([
      [Markup.button.callback('Start Dialog', 'start_dialog')],
    ]);

    ctx.reply(
      `Welcome to the AI Assistant bot! 😊 I'm here to help you with any questions or concerns you may have. Click the button below to start a dialog.`,
      { reply_markup: inlineKeyboard },
    );
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
