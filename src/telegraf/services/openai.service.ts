import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenAiService {
  async getResponse(
    conversationHistory: Array<{ role: string; content: string }>,
  ): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: conversationHistory,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        },
      );
      const reply = response.data.choices[0].message.content;
      return reply;
    } catch (error) {
      console.error('Error sending request to OpenAI:', error.message);
      return 'An error occurred while processing your request.';
    }
  }
}
