import { Module, OnModuleInit } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { OrdersService } from '../../modules/orders/orders.service';
import { BillsService } from '../../modules/bills/bills.service';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../modules/orders/entities/order.entity';
import { LocationsService } from '../../modules/locations/locations.service';
import { StandardPriceService } from '../../modules/standard-price/standard-price.service';
import { Bill } from '../../modules/bills/entities/bill.entity';
import { Location } from '../../modules/locations/entities/location.entity';
import { LocationHandleService } from '../../modules/location-handle/location-handle.service';
import { LocationHandle } from '../../modules/location-handle/entities/location-handle.entity';
import { StandardPrice } from '../../modules/standard-price/entities/standard-price.entity';
import { StandardPriceHistory } from '../../modules/standard-price/entities/standard-price-history.entity';
import { RedisModule } from '../../modules/redis/redis.module';
import { PackageService } from '../../modules/package/package.service';
import { Package } from '../../modules/package/entities/package.entity';
import { WebhookFactory } from '../message-broker/webhook.factory';
import { RabbitMQServices } from '../message-broker/webhook.types';
import { HttpModule } from '@nestjs/axios';
import { JobRegister } from '../../modules/job-register/entities/job-register.entity';
import { Repository } from 'typeorm';
import { PaymentLog } from '../../modules/payment_log/entities/payment_log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      JobRegister,
      Bill,
      Location,
      LocationHandle,
      Package,
      StandardPrice,
      StandardPriceHistory,
      PaymentLog,
    ]),
    RedisModule,
    HttpModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    OrdersService,
    BillsService,
    PackageService,
    LocationsService,
    LocationHandleService,
    StandardPriceService,
    WebhookFactory.Build(RabbitMQServices.VNPay),
  ],
})
export class PaymentModule implements OnModuleInit {
  constructor(
    @InjectRepository(JobRegister)
    private jobRegisterRepository: Repository<JobRegister>,
  ) {}
  public async onModuleInit(): Promise<void> {
    await Promise.all([
      this.jobRegisterRepository
        .save(
          Object.assign(new JobRegister(), {
            name: PaymentService.reSyncJobKey,
            is_process: false,
          } as JobRegister),
        )
        .catch((ex) => {
          console.log(ex);
        }),
      this.jobRegisterRepository
        .save(
          Object.assign(new JobRegister(), {
            name: PaymentService.clearPaymentLogJobKey,
            is_process: false,
          } as JobRegister),
        )
        .catch(() => ({})),
    ]);
  }
}
