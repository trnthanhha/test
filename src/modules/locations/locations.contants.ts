export enum LocationType {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export enum LocationStatus {
  PENDING = 'pending',
  REJECTED = 'rejected',
  APPROVED = 'approved',
}

export enum LocationNFTStatus {
  PENDING = 'pending',
  REJECTED = 'rejected',
  APPROVED = 'approved',
  MINTED = 'minted',
}

export enum LocationPurchaseStatus {
  Unauthorized = 'unauthorized',
}

export const DefaultSafeZoneRadius = 50;
export const MinimumDistanceConflict = 100;
