import { Order } from '../entities/order.entity';

export interface PaymentVendorAdapters {
  generateURLRedirect(order: Order, clientUnique: any): string;
}
