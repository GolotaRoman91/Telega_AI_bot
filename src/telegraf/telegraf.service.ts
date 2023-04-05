import { Injectable } from '@nestjs/common';
import { Telegraf, Context } from 'telegraf';
import axios from 'axios';
import { message } from 'telegraf/filters';

@Injectable()
export class TelegrafService {
  private bot: Telegraf<Context>;

  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

    this.bot.command('echo', (ctx) => {
      const text = ctx.message?.text || '';
      ctx.reply(text.replace('/echo', '').trim());
    });

    this.bot.on(message('text'), async (ctx) => {
      const content = ctx.message.text;
      const response = await this.sendMessageToOpenAI(content);
      await ctx.reply(response);
    });

    this.bot.launch();
  }

  getBotInstance(): Telegraf<Context> {
    return this.bot;
  }

  private async sendMessageToOpenAI(content: string) {
    console.log('Sending request to OpenAI with content:', content);

    try {
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

      const reply = response.data.choices[0].message.content;
      console.log('Received reply from OpenAI:', reply);
      return reply;
    } catch (error) {
      console.error('Error sending request to OpenAI:', error.message);
      return 'An error occurred while processing your request.';
    }
  }
}
