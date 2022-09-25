export enum BillStatus {
  UNAUTHORIZED = 'unauthorized',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentVendor {
  VNPAY = 'vnpay',
  LOCAMOS = 'locamos',
}

export enum PaymentType {
  POINT = 'point',
  MONEY = 'money',
}
