import { Module } from '@nestjs/common';
import { TelegrafService } from './telegraf.service';
import { TelegrafController } from './telegraf.controller';
import { Telegraf } from 'telegraf';

@Module({
  providers: [
    TelegrafService,
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
