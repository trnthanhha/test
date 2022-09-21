import { Controller, Get, Req } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get('/vnpay')
  webhookVNPay(@Req() req): void {
    console.log('whoami? ', req.query);
  }
}
