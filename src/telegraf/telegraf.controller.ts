import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { TelegrafService } from './telegraf.service';

@Controller('telegraf')
export class TelegrafController {
  constructor(private readonly telegrafService: TelegrafService) {}

  @Post('webhook')
  async handleWebhook(@Req() request: Request): Promise<void> {
    const telegrafInstance = this.telegrafService.getBotInstance();
    await telegrafInstance.handleUpdate(request.body);
  }
}
