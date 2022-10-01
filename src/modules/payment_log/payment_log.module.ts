import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentLog } from './entities/payment_log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentLog])],
})
export class PaymentLogModule {}
