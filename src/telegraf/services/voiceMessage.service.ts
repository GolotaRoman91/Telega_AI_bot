import { Injectable } from '@nestjs/common';
import { OggConverterService } from './oggConverter.service';
import { Context } from 'telegraf';
import { OpenAiService } from './openai.service';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';

@Injectable()
export class VoiceMessageService {
  constructor(
    private oggConverterService: OggConverterService,
    private openAiService: OpenAiService,
    private conversationService: ConversationService,
    private messageService: MessageService,
  ) {}

  async handleVoiceMessage(
    ctx: Context,
    userId: number,
    userStartedConversation: Set<number>,
  ) {
    if (
      this.messageService.isUserInConversation(userId, userStartedConversation)
    ) {
      const message = ctx.message as any;

      if (message.voice) {
        const link = await ctx.telegram.getFileLink(message.voice.file_id);
        const userIdString = String(userId);
        const oggPath = await this.oggConverterService.create(
          link.href,
          userIdString,
        );
        const mp3Path = await this.oggConverterService.toMp3(
          oggPath,
          userIdString,
        );
        const transcribedText: any = await this.openAiService.transcription(
          mp3Path,
        );
        const conversationId = await this.conversationService.getConversationId(
          userId,
        );
        if (conversationId !== null) {
          await this.messageService.processUserMessage(
            ctx,
            conversationId,
            transcribedText,
          );
        }
      }
    } else {
      this.messageService.promptUserToStartConversation(ctx);
    }
  }
}
