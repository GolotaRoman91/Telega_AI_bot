import { Injectable } from '@nestjs/common';
import { OggConverterService } from './oggConverter.service';
import { Context } from 'telegraf';

@Injectable()
export class VoiceMessageService {
  constructor(private oggConverterService: OggConverterService) {}

  async handleVoiceMessage(
    ctx: Context,
    userId: number,
    userStartedConversation: Set<number>,
    isUserInConversation: (
      userId: number,
      userStartedConversation: Set<number>,
    ) => boolean,
    promptUserToStartConversation: (ctx: Context) => void,
  ) {
    if (isUserInConversation(userId, userStartedConversation)) {
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
        await ctx.reply(mp3Path as string);
      }
    } else {
      promptUserToStartConversation(ctx);
    }
  }
}
