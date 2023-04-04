import { Controller, Post, Req } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { Request } from 'express';

@Controller('telegraf')
export class TelegrafController {
  constructor(private readonly telegrafService: Telegraf) {}

  @Post('webhook')
  async handleWebhook(@Req() request: Request): Promise<void> {
    await this.telegrafService.handleUpdate(request.body);
  }
}
