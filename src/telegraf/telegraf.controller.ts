import { Controller } from '@nestjs/common';
import { TelegrafService } from './services/telegraf.service';

@Controller('telegraf')
export class TelegrafController {
  constructor(private readonly telegrafService: TelegrafService) {}
}
