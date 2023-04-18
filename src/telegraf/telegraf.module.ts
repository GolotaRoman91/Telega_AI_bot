import { Module } from '@nestjs/common';
import { TelegrafService } from './services/telegraf.service';
import { TelegrafController } from './telegraf.controller';
import { Telegraf } from 'telegraf';
import { OpenAiService } from './services/openai.service';

import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [
    TelegrafService,
    OpenAiService,
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
