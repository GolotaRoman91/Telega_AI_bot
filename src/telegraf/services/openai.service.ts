import { Inject, Injectable, forwardRef } from '@nestjs/common';
import axios from 'axios';
import { MessageService } from './message.service';
import { ConversationService } from './conversation.service';

@Injectable()
export class OpenAiService {
  constructor(
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
    private conversationService: ConversationService,
  ) {}
  async getResponse(
    conversationId: number,
    conversationHistory: Array<{ role: string; content: string }>,
  ): Promise<string> {
    try {
      console.log('Sending data to OpenAI:', {
        model: 'gpt-3.5-turbo',
        messages: conversationHistory,
      });
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
      await this.messageService.createBotMessage(conversationId, reply);

      return reply;
    } catch (error) {
      console.error('Error sending request to OpenAI:', error.message);
      return 'An error occurred while processing your request.';
    }
  }
}
