import { Body, Controller, Post } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  create(@Body() obj: any): void {
    console.log(obj);
  }
}
