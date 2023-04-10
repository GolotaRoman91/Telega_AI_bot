import { Module } from '@nestjs/common';
import { TelegrafService } from './telegraf.service';
import { TelegrafController } from './telegraf.controller';
import { Telegraf } from 'telegraf';
import { OpenAiService } from './openai.service';
import { ConversationHistoryService } from './conversation-history.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConversationHistory } from './conversation-history.model';

@Module({
  imports: [SequelizeModule.forFeature([ConversationHistory])],
  providers: [
    TelegrafService,
    OpenAiService,
    ConversationHistoryService,
    {
      provide: Telegraf,
      useFactory: (telegrafService: TelegrafService) =>
        telegrafService.getBotInstance(),
      inject: [TelegrafService],
    },
  ],
  exports: [TelegrafService],
  controllers: [TelegrafController],
})
export class TelegrafModule {}
