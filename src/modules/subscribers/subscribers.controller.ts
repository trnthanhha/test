import {
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  Inject,
  Req,
  Get,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('subscribers')
@UseInterceptors(ClassSerializerInterceptor)
export default class SubscribersController {
  constructor(
    @Inject('SUBSCRIBERS_SERVICE') private subscribersService: ClientProxy,
  ) {}

  @Get()
  async createPost(@Req() subscriber) {
    return this.subscribersService.emit(
      {
        cmd: 'add-subscriber',
      },
      subscriber.query,
    );
  }
}
