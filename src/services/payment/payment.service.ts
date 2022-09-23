import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrdersService } from '../../modules/orders/orders.service';
import { PaymentStatus } from '../../modules/orders/orders.constants';
import { Bill } from '../../modules/bills/entities/bill.entity';
import { Order } from '../../modules/orders/entities/order.entity';
import { BillStatus } from '../../modules/bills/bills.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BillsService } from '../../modules/bills/bills.service';
import { PrepareError } from '../../errors/types';
import { UserPackage } from '../../modules/user_package/entities/user_package.entity';
import { Location } from '../../modules/locations/entities/location.entity';
import { LocationPurchaseStatus } from '../../modules/locations/locations.contants';
import { UPackagePurchaseStatus } from '../../modules/user_package/user_package.constants';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly billsService: BillsService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  @Cron('*/30 * * * * *')
  syncPaymentStatus() {
    // console.log('sync payment status each 30s');
  }

  async syncOrderStatus(payload: any) {
    const manager: EntityManager = this.orderRepository.manager;
    const { vnp_ResponseCode, vnp_TxnRef, vnp_TransactionNo } = payload;
    let bill: Bill;
    let order: Order;
    let location: Location;
    let pkg: UserPackage;
    try {
      bill = await this.billsService.findOneByRefID(vnp_TxnRef);
      order = bill.order;
      if (order.payment_status === PaymentStatus.PAID) {
        this.logger.log('order closed, no need to sync, orderID: ', order.id);
        throw new BadRequestException();
      }

      order.payment_status =
        (vnp_ResponseCode === '00' && PaymentStatus.PAID) ||
        PaymentStatus.FAILED;

      if (order.payment_status === PaymentStatus.PAID) {
        bill.status = BillStatus.PAID;
        if (order.location_id > 0) {
          location = await manager
            .getRepository(Location)
            .findOneBy({ id: order.location_id });
        } else if (order.user_package_id > 0) {
          pkg = await manager
            .getRepository(UserPackage)
            .findOneBy({ id: order.user_package_id });
        }
      }
      bill.status = this.orderStatusToBillStatus(order.payment_status);
      bill.invoice_number = vnp_TransactionNo;
    } catch (ex) {
      throw new PrepareError(ex, 'Not found order');
    }

    return this.orderRepository.manager.transaction(
      (entityManager): Promise<any[]> => {
        return Promise.all([
          this.ordersService.update(order.id, order, entityManager),
          this.billsService.update(bill, entityManager),
          // Update location / package
          new Promise((resolve, reject) => {
            if (location) {
              this.updateLocation(bill.status, location, entityManager)
                .then(resolve)
                .catch(reject);
              return;
            }
            if (pkg) {
              this.updateUserPackage(bill.status, pkg, entityManager)
                .then(resolve)
                .catch(reject);
              return;
            }

            resolve(undefined);
          }),
        ]);
      },
    );
  }

  orderStatusToBillStatus(pmStt: PaymentStatus): BillStatus {
    for (const stt in BillStatus) {
      if (pmStt === BillStatus[stt]) {
        return BillStatus[stt];
      }
    }

    return BillStatus.UNAUTHORIZED;
  }

  updateLocation(
    billStatus: BillStatus,
    location: Location,
    entityManager: EntityManager,
  ) {
    if (billStatus === BillStatus.PAID) {
      location.purchase_status = null;
      location.paid_at = new Date();
    } else {
      location.purchase_status = LocationPurchaseStatus.FAILED;
    }
    return entityManager.update(
      Location,
      {
        id: location.id,
      },
      location,
    );
  }

  updateUserPackage(
    billStatus: BillStatus,
    userPackage: UserPackage,
    entityManager: EntityManager,
  ) {
    if (billStatus === BillStatus.PAID) {
      userPackage.purchase_status = UPackagePurchaseStatus.PAID;
      userPackage.paid_at = new Date();
    } else {
      userPackage.purchase_status = UPackagePurchaseStatus.FAILED;
    }
    return entityManager.update(
      UserPackage,
      {
        id: userPackage.id,
      },
      userPackage,
    );
  }
}
