export enum PaymentStatus {
  UNAUTHORIZED = 'unauthorized',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentType {
  CASH = 'cash',
  POINT = 'point',
  PACKAGE = 'package',
}

export enum PaymentTarget {
  LOCATION = 'location',
  PACKAGE = 'package',
}
