import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrdersService } from '../../modules/orders/orders.service';
import { PaymentStatus } from '../../modules/orders/orders.constants';
import { Bill } from '../../modules/bills/entities/bill.entity';
import { Order } from '../../modules/orders/entities/order.entity';
import { BillStatus } from '../../modules/bills/bills.constants';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  MoreThan,
  LessThanOrEqual,
  Repository,
  LessThan,
} from 'typeorm';
import { BillsService } from '../../modules/bills/bills.service';
import { PrepareError } from '../../errors/types';
import { UserPackage } from '../../modules/user_package/entities/user_package.entity';
import { Location } from '../../modules/locations/entities/location.entity';
import { LocationPurchaseStatus } from '../../modules/locations/locations.contants';
import { UPackagePurchaseStatus } from '../../modules/user_package/user_package.constants';
import { PaymentResult } from './payment.types';
import { REDIS_CLIENT_PROVIDER } from '../../modules/redis/redis.constants';
import Redis from 'ioredis';
import { JobRegister } from '../../modules/job-register/entities/job-register.entity';
import { PaymentLog } from '../../modules/payment_log/entities/payment_log.entity';
import { PaymentLogTopic } from '../../modules/payment_log/payment_log.type';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  public static readonly reSyncJobKey = `${PaymentService.name}-reSync`;
  public static readonly clearPaymentLogJobKey = `${PaymentService.name}-clearPaymentLog`;

  constructor(
    private readonly ordersService: OrdersService,
    private readonly billsService: BillsService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(JobRegister)
    private jobRegisterRepository: Repository<JobRegister>,
    @InjectRepository(PaymentLog)
    private paymentLogRepository: Repository<PaymentLog>,
    @Inject(REDIS_CLIENT_PROVIDER) private readonly redis: Redis,
  ) {}

  @Cron('0 */30 * * * *')
  async jobReSync() {
    const onProcess = await this.markJobProcessing(PaymentService.reSyncJobKey);
    if (onProcess) {
      return;
    }
    console.log('sync payment status each 5 minutes');

    this.runReSync().finally(() => {
      this.markJobDone(PaymentService.reSyncJobKey);
    });
  }

  @Cron('0 0 17 * * *')
  async jobClearPaymentLog() {
    const onProcess = await this.markJobProcessing(
      PaymentService.clearPaymentLogJobKey,
    );
    if (onProcess) {
      return;
    }
    console.log('clear payment log each 24 hours');
    // 90 days before
    const dateAt60DaysBefore = new Date(
      new Date().setDate(new Date().getDate() - 90),
    );
    return this.paymentLogRepository
      .delete({
        created_at: LessThan(dateAt60DaysBefore),
        topic: PaymentLogTopic.VNPAY,
      })
      .finally(() => {
        this.markJobDone(PaymentService.clearPaymentLogJobKey);
      });
  }

  async runReSync() {
    const take = 50;
    let page = 0;
    const current = new Date();
    const at48HourBefore = new Date(current.setDate(current.getDate() - 2));
    while (true) {
      const invalidOrders = await this.orderRepository.find({
        // soft delete pending location, check all orders are pending created > 48h, use to buy location
        where: {
          payment_status: PaymentStatus.UNAUTHORIZED,
          created_at: LessThanOrEqual(at48HourBefore),
          location_id: MoreThan(0),
        },
        take,
        skip: page * take,
      });
      if (!invalidOrders.length) {
        break;
      }

      const processes = [];
      invalidOrders.forEach((o) => {
        processes.push(this.rejectBillOrderAndSoftDeleteLocation(o));
      });

      await Promise.all(processes);

      if (invalidOrders.length < take) {
        break;
      }
      page++;
    }
  }

  async markJobProcessing(name: string) {
    const rs = await this.jobRegisterRepository.update(
      {
        name,
        is_process: false,
      },
      {
        is_process: true,
      },
    );
    return !!rs.affected;
  }

  async markJobDone(name: string) {
    await this.jobRegisterRepository.update(
      {
        name,
      },
      {
        is_process: false,
      },
    );
  }

  async rejectBillOrderAndSoftDeleteLocation(order: Order) {
    const [bill, location] = await Promise.all([
      this.orderRepository.manager.getRepository(Bill).findOneBy({
        order_id: order.id,
        status: BillStatus.UNAUTHORIZED,
      }),
      this.orderRepository.manager.getRepository(Location).findOneBy({
        id: order.location_id,
      }),
    ]);

    return this.orderRepository.manager
      .transaction(async (txManager) => {
        let rs = await txManager.getRepository(Order).update(
          {
            id: order.id,
            version: order.version,
          },
          {
            version: order.version + 1,
            payment_status: PaymentStatus.CANCELLED,
          },
        );
        if (!rs.affected) {
          throw new BadRequestException('order was changed');
        }

        if (bill) {
          rs = await txManager.getRepository(Bill).update(
            {
              id: bill.id,
              version: bill.version,
            },
            {
              version: bill.version + 1,
              status: BillStatus.CANCELLED,
            },
          );
          if (!rs.affected) {
            throw new BadRequestException('bill was changed');
          }
        }

        if (location) {
          rs = await txManager.getRepository(Location).softDelete({
            id: location.id,
            version: location.version,
          });
          if (!rs.affected) {
            throw new BadRequestException('location was changed');
          }
        }
      })
      .catch(() => ({}));
  }

  async syncOrderStatus(pmResult: PaymentResult) {
    const manager: EntityManager = this.orderRepository.manager;
    let bill: Bill;
    let order: Order;
    let location: Location;
    let pkg: UserPackage;
    try {
      bill = await this.billsService.findOneByRefID(pmResult.uuid);
      order = bill.order;
      if (order.payment_status === PaymentStatus.PAID) {
        this.logger.log('order closed, no need to sync, orderID: ', order.id);
        throw new BadRequestException();
      }

      if (order.payment_status === PaymentStatus.CANCELLED) {
        this.logger.log('order need to refund, orderID: ', order.id);
        throw new BadRequestException();
      }

      order.payment_status = pmResult.status;
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
      bill.invoice_number = pmResult.invoice_number;
    } catch (ex) {
      throw new PrepareError(ex, 'Not found order');
    }

    return this.orderRepository.manager.transaction(
      (txManager): Promise<any[]> => {
        return Promise.all([
          this.ordersService.update(order.id, order, txManager),
          this.billsService.update(bill, txManager),
          // Update location / package
          new Promise((resolve, reject) => {
            if (location) {
              this.updateLocation(bill.status, location, txManager)
                .then(resolve)
                .catch(reject);
              return;
            }
            if (pkg) {
              this.updateUserPackage(bill.status, pkg, txManager)
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

  async updateUserPackage(
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
    const updateResult = await entityManager.update(
      UserPackage,
      {
        id: userPackage.id,
        version: userPackage.version,
      },
      Object.assign(userPackage, { version: userPackage.version + 1 }),
    );
    if (!updateResult.affected) {
      throw new InternalServerErrorException(
        `UserPackage was changed, id: ${userPackage.id}`,
      );
    }
  }
}
