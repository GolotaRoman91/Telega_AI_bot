import { Injectable } from '@nestjs/common';
import { Telegraf, Context } from 'telegraf';
import axios from 'axios';

@Injectable()
export class TelegrafService {
  private bot: Telegraf<Context>;

  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

    this.bot.command('echo', (ctx) => {
      const text = ctx.message?.text || '';
      ctx.reply(text.replace('/echo', '').trim());
    });

    this.bot.launch();
  }

  getBotInstance(): Telegraf<Context> {
    return this.bot;
  }

  private async sendMessageToOpenAI(content: string) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      },
    );

    return response.data.choices[0].message.content;
  }
}
