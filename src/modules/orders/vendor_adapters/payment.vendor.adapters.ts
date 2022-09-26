import { PaymentVNPayImplementor } from './payment.vnpay.implementor';
import { OrderStatusDto } from '../dto/order-status-dto';
import { TransactionInfo } from './payment.types';

export class PaymentGatewayFactory {
  public static Build = (): PaymentVendorAdapters => {
    return new PaymentVNPayImplementor();
  };
}

export interface PaymentVendorAdapters {
  generateURLRedirect(txInfo: TransactionInfo, clientUnique: any): string;
  decodeResponse(req: Request): OrderStatusDto;
}
