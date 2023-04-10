import { Controller } from '@nestjs/common';
import { TelegrafService } from './telegraf.service';

@Controller('telegraf')
export class TelegrafController {
  constructor(private readonly telegrafService: TelegrafService) {}
}
