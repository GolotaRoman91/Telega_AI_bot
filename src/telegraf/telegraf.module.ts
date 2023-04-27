import { Module } from '@nestjs/common';
import { TelegrafService } from './services/telegraf.service';
import { TelegrafController } from './telegraf.controller';
import { Telegraf } from 'telegraf';
import { OpenAiService } from './services/openai.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { Conversation } from './models/conversation.model';
import { Message } from './models/message.model';
import { ConversationService } from './services/conversation.service';
import { MessageService } from './services/message.service';
import { UserService } from './services/user.service';
import { CallbackQueryService } from './services/callbackQuery.service';
import { OggConverterService } from './services/oggConverter.service';
import { DIRNAME_TOKEN } from './telegraf.constants';

@Module({
  imports: [SequelizeModule.forFeature([User, Conversation, Message])],
  providers: [
    TelegrafService,
    UserService,
    MessageService,
    CallbackQueryService,
    ConversationService,
    OpenAiService,
    {
      provide: DIRNAME_TOKEN,
      useValue: __dirname,
    },
    OggConverterService,
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
