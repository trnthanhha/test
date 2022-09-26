import { Location } from '../locations/entities/location.entity';
import { PrepareOrder } from './orders.checkout.types';
import { BadRequestException } from '@nestjs/common';
import {
  LocationPurchaseStatus,
  LocationStatus,
} from '../locations/locations.contants';
import { OrdersCheckoutImplementorPoint } from './orders.checkout.implementor.point';

describe('Checkout by point', () => {
  it('validateData - location is owned', async () => {
    await expect(
      getEmptyFlowInstance().validateData({
        location: (() => {
          const loc = new Location();
          loc.user_id = 1;

          return loc;
        })(),
      } as PrepareOrder),
    ).rejects.toThrowError(
      new BadRequestException('Location is unable to purchase'),
    );
  });

  it('validateData - location is not paid yet', async () => {
    await expect(
      getEmptyFlowInstance().validateData({
        location: (() => {
          const loc = new Location();
          loc.purchase_status = LocationPurchaseStatus.FAILED;

          return loc;
        })(),
      } as PrepareOrder),
    ).rejects.toThrowError(
      new BadRequestException('Location is unable to purchase'),
    );
  });

  it('validateData - location is not approved', async () => {
    await expect(
      getEmptyFlowInstance().validateData({
        location: (() => {
          const loc = new Location();
          loc.status = LocationStatus.PENDING;

          return loc;
        })(),
      } as PrepareOrder),
    ).rejects.toThrowError(
      new BadRequestException('Location is unable to purchase'),
    );
  });

  it('validateData - location is blacklist', async () => {
    await expect(
      getEmptyFlowInstance().validateData({
        location: (() => {
          const loc = new Location();
          loc.is_blacklist = true;

          return loc;
        })(),
      } as PrepareOrder),
    ).rejects.toThrowError(
      new BadRequestException('Location is unable to purchase'),
    );
  });

  // it('validateData - succeeded', async () => {
  //   await expect(
  //     getEmptyFlowInstance().validateData({
  //       location: (() => {
  //         const loc = new Location();
  //         loc.status = LocationStatus.APPROVED;
  //
  //         return loc;
  //       })(),
  //     } as PrepareOrder),
  //   ).resolves.not.toThrowError();
  // });
});

function getEmptyFlowInstance(): OrdersCheckoutImplementorPoint {
  return new OrdersCheckoutImplementorPoint(
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  );
}
