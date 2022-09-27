import { Order } from '../entities/order.entity';

export class OrderStatusDto extends Order {
  status_code: string;
  message: string;
  success: boolean;
}
