import { Inject, Injectable, forwardRef } from '@nestjs/common';
import axios from 'axios';
import { MessageService } from './message.service';
import { Configuration, OpenAIApi } from 'openai';
import { createReadStream } from 'fs';

@Injectable()
export class OpenAiService {
  private openai;

  constructor(
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
  ) {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async getResponse(conversationId, conversationHistory, prompt) {
    try {
      console.log('Sending data to OpenAI:', {
        model: 'gpt-3.5-turbo',
        messages: [...conversationHistory, { role: 'system', content: prompt }],
      });

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            ...conversationHistory,
            { role: 'system', content: prompt },
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
      await this.messageService.createBotMessage(conversationId, reply);

      return reply;
    } catch (error) {
      console.error('Error sending request to OpenAI:', error.message);
      return 'An error occurred while processing your request.';
    }
  }

  async transcription(filePath) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(filePath),
        'whisper-1',
      );
      return response.data.text;
    } catch (error) {
      console.error('Error transcribing file:', error.message);
      return 'An error occurred while processing your transcription request.';
    }
  }
}
