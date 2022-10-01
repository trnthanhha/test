import {
  Controller,
  Inject,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { PaymentService } from '../../services/payment/payment.service';
import { PrepareError, SkipError } from '../../errors/types';
import {
  PaymentStatus,
  PaymentTarget,
  PaymentType,
} from '../orders/orders.constants';
import { TransactionInfo } from '../orders/vendor_adapters/payment.types';
import { ConsumersService } from './consumers.service';
import { TransactionLinkageService } from '../../services/locamos-linkage/transaction.service';
import { HttpService } from '@nestjs/axios';
import { VNPayExtendData } from '../../services/payment/payment.types';
import { RabbitMQServices } from '../../services/message-broker/webhook.types';

@Controller()
export class ConsumersController {
  private readonly logger = new Logger(ConsumersController.name);
  constructor(
    private readonly paymentService: PaymentService,
    private readonly consumersService: ConsumersService,
    private readonly httpService: HttpService,
    @Inject(RabbitMQServices.VNPay) private publisher: ClientProxy,
  ) {}

  @EventPattern('vnpay')
  async updateVNPayOrder(
    @Payload() payload: { raw: any; extend: VNPayExtendData },
    @Ctx() ctx: RmqContext,
  ) {
    this.logger.log('receive message IPN from VNPay, value: ', payload);
    const {
      vnp_ResponseCode,
      vnp_TxnRef: uuid,
      vnp_TransactionNo: invoice_number,
    } = payload.raw;
    const status =
      (vnp_ResponseCode === '00' && PaymentStatus.PAID) || PaymentStatus.FAILED;
    if (
      !payload.extend.syncedLocaMos &&
      payload.extend.target === PaymentTarget.PACKAGE
    ) {
      // update combo bought to old system
      const rs = await this.verifyFrom3rd({
        info: {
          uuid,
        } as TransactionInfo,
        type: PaymentType.CASH,
      });
      if (!rs.success) {
        if (rs.retry) {
          this.requeue(ctx);
        } else {
          this.drop(ctx);
        }
        return;
      }
      payload.extend.syncedLocaMos = true;
      this.publisher.emit('vnpay', payload); // re-queue with new updated
      this.ack(ctx);
      return;
    }

    await this.paymentService
      .syncOrderStatus({ uuid, status, invoice_number })
      .then(() => {
        this.ack(ctx);
      })
      .catch((ex) => {
        if (
          ex instanceof PrepareError ||
          ex?.message?.includes(
            'duplicate key value violates unique constraint',
          )
        ) {
          this.drop(ctx);
          return;
        }
        this.requeue(ctx);
      });
  }

  @EventPattern('locamos')
  async updateLocaMosSystem(
    @Payload() payload: { info: TransactionInfo; type: PaymentType },
    @Ctx() ctx: RmqContext,
  ) {
    this.logger.log('receive message to sync LocaMos, value: ', payload);
    switch (payload.type) {
      case PaymentType.PACKAGE:
        break;
      case PaymentType.POINT:
        // send to locamos first
        const rs = await this.verifyFrom3rd(payload);
        if (rs.success) {
          break;
        }
        if (rs.retry) {
          this.requeue(ctx);
        } else {
          this.drop(ctx);
        }
        return;
      default:
        this.logger.log('unimplemented payment type: ', payload.type);
        this.drop(ctx);
        return;
    }

    this.paymentService
      .syncOrderStatus({
        uuid: payload.info.uuid,
        status: PaymentStatus.PAID,
        invoice_number: null,
      })
      .then(() => {
        this.ack(ctx);
      })
      .catch((ex) => {
        if (
          ex instanceof PrepareError ||
          ex?.message?.includes(
            'duplicate key value violates unique constraint',
          )
        ) {
          this.drop(ctx);
          return;
        }
        this.requeue(ctx);
      });
  }

  async verifyFrom3rd(payload: {
    info: TransactionInfo;
    type: PaymentType;
  }): Promise<{
    success: boolean;
    retry?: boolean;
  }> {
    const data = await this.consumersService.prepareDataForLocaMos(
      payload.info,
    );
    try {
      await new TransactionLinkageService(this.httpService).notifyBuyPackage(
        data.owner?.locamos_access_token,
        data.txInfo,
        payload.type,
      );
    } catch (ex) {
      if (ex instanceof SkipError) {
        return {
          success: true, // maybe retry in our systems -> skip locamos system
        };
      }

      if (ex instanceof InternalServerErrorException) {
        this.logger.log(
          'response not correct after notifyBuyPackage to LocaMos',
        );
        return {
          success: false,
          retry: false,
        };
      }

      return {
        success: false,
        retry: true,
      };
    }

    return {
      success: true,
    };
  }

  ack(ctx) {
    const channel = ctx.getChannelRef();
    const originalMsg = ctx.getMessage();
    channel.ack(originalMsg);
  }

  requeue(ctx) {
    const channel = ctx.getChannelRef();
    const originalMsg = ctx.getMessage();
    channel.reject(originalMsg, true);
  }

  drop(ctx) {
    const channel = ctx.getChannelRef();
    const originalMsg = ctx.getMessage();
    channel.reject(originalMsg, false);
  }
}
