import { Module } from '@nestjs/common';
import { TelegrafService } from './telegraf.service';
import { TelegrafController } from './telegraf.controller';
import { Telegraf } from 'telegraf';
import { OpenAiService } from './openai.service';
import { ConversationHistoryService } from './conversation-history.service';
import { CallbackQueryService } from './callback-query.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConversationHistory } from './conversation-history.model';
import { MessageHandlerService } from './message-handler.service';

@Module({
  imports: [SequelizeModule.forFeature([ConversationHistory])],
  providers: [
    TelegrafService,
    OpenAiService,
    ConversationHistoryService,
    CallbackQueryService,
    MessageHandlerService,
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
