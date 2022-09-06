import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PaymentService {
    @Cron('*/30 * * * * *')
    syncPaymentStatus() {

    }
}
