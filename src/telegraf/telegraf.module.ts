import { Module } from '@nestjs/common';
import { TelegrafService } from './services/telegraf.service';
import { TelegrafController } from './telegraf.controller';
import { Telegraf } from 'telegraf';
import { OpenAiService } from './services/openai.service';
import { ConversationHistoryService } from './services/conversation-history.service';
import { CallbackQueryService } from './services/callback-query.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConversationHistory } from './models/conversation-history.model';
import { MessageHandlerService } from './services/message-handler.service';

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
