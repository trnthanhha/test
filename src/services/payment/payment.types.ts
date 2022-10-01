import {
  PaymentStatus,
  PaymentTarget,
} from '../../modules/orders/orders.constants';

export type PaymentResult = {
  uuid: string;
  status: PaymentStatus;
  invoice_number: string;
};

export type VNPayExtendData = {
  target: PaymentTarget;
  syncedLocaMos?: boolean;
};
