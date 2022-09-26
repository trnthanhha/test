import { PaymentStatus } from '../../modules/orders/orders.constants';

export type PaymentResult = {
  uuid: string;
  status: PaymentStatus;
  invoice_number: string;
};
