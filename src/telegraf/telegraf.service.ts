import { Injectable } from '@nestjs/common';
import { Telegraf, Context, Markup } from 'telegraf';
import { OpenAiService } from './openai.service';
import { ConversationHistoryService } from './conversation-history.service';

@Injectable()
export class TelegrafService {
  private bot: Telegraf<Context>;
  private userStartedConversation: Set<number>;

  constructor(
    private openAiService: OpenAiService,
    private conversationHistoryService: ConversationHistoryService,
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

    const inlineKeyboard = Markup.inlineKeyboard([
      Markup.button.callback('Start conversation', 'start_conversation'),
      Markup.button.callback('Conversation archive', 'conversation_archive'),
    ]);

    ctx.reply(welcomeMessage, inlineKeyboard);
  }

  private handleCallbackQuery(ctx) {
    const userId = ctx.callbackQuery.from.id;
    const data = ctx.callbackQuery.data;

    if (data === 'start_conversation') {
      this.userStartedConversation.add(userId);
      ctx.reply(
        'You have started a new conversation. You can now send messages.',
      );
    } else if (data === 'conversation_archive') {
      this.displayConversationArchive(ctx, userId);
    } else if (data === 'end_conversation') {
      this.userStartedConversation.delete(userId);
      const inlineKeyboard = Markup.inlineKeyboard([
        Markup.button.callback('Start conversation', 'start_conversation'),
        Markup.button.callback('Conversation archive', 'conversation_archive'),
      ]);
      ctx.reply(
        'Conversation has ended. Please select an action to proceed.',
        inlineKeyboard,
      );
    }

    ctx.answerCbQuery();
  }

  private handleEchoCommand(ctx) {
    const text = ctx.message.text;
    ctx.reply(text.replace('/echo', '').trim());
  }

  private async handleTextMessage(ctx) {
    const content = ctx.message?.text ?? '';
    const userId = ctx.message?.from?.id;

    if (!content || !userId) return;

    if (!this.userStartedConversation.has(userId)) {
      const inlineKeyboard = Markup.inlineKeyboard([
        Markup.button.callback('Start conversation', 'start_conversation'),
        Markup.button.callback('Conversation archive', 'conversation_archive'),
      ]);

      ctx.reply('Please select an action to proceed.', inlineKeyboard);
      return;
    }

    const userConversationHistory =
      await this.conversationHistoryService.getOrCreateConversationHistory(
        userId,
      );

    userConversationHistory.push({ role: 'user', content });
    const response = await this.openAiService.getResponse(
      userConversationHistory,
    );
    userConversationHistory.push({ role: 'assistant', content: response });

    const endConversationInlineKeyboard = Markup.inlineKeyboard([
      Markup.button.callback('End conversation', 'end_conversation'),
    ]);

    await ctx.reply(response, endConversationInlineKeyboard);
    await this.conversationHistoryService.updateConversationHistory(
      userId,
      userConversationHistory,
    );
  }

  private async displayConversationArchive(ctx, userId) {
    const userConversationHistory =
      await this.conversationHistoryService.getOrCreateConversationHistory(
        userId,
      );
    const formattedHistory = userConversationHistory
      .map(
        (message) =>
          `${message.role === 'user' ? 'You' : 'AI Assistant'}: ${
            message.content
          }`,
      )
      .join('\n');

    ctx.reply(`Here is your conversation archive:\n\n${formattedHistory}`);
  }

  getBotInstance(): Telegraf<Context> {
    return this.bot;
  }
}
