import { Order } from '../entities/order.entity';
import { PaymentVNPayImplementor } from './payment.vnpay.implementor';
import { OrderStatusDto } from '../dto/order-status-dto';

export class PaymentGatewayFactory {
  public static Build = (): PaymentVendorAdapters => {
    return new PaymentVNPayImplementor();
  };
}

export interface PaymentVendorAdapters {
  generateURLRedirect(order: Order, clientUnique: any): string;
  decodeResponse(req: Request): OrderStatusDto;
}
