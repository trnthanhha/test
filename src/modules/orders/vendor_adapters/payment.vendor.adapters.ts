import { Order } from '../entities/order.entity';
import { PaymentVNPayImplementor } from './payment.vnpay.implementor';

export const GetPaymentGateway = (): PaymentVendorAdapters => {
  return new PaymentVNPayImplementor();
};

export interface PaymentVendorAdapters {
  generateURLRedirect(order: Order, clientUnique: any): string;
}
