import { Location } from '../locations/entities/location.entity';
import { PrepareOrder } from './orders.checkout.types';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  LocationPurchaseStatus,
  LocationStatus,
} from '../locations/locations.contants';
import { OrdersCheckoutImplementorPoint } from './orders.checkout.implementor.point';
import { Package } from '../package/entities/package.entity';

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

  it('validateData - not found package to buy', async () => {
    await expect(
      getEmptyFlowInstance().validateData({
        location: (() => {
          const loc = new Location();
          loc.status = LocationStatus.APPROVED;

          return loc;
        })(),
      } as PrepareOrder),
    ).rejects.toThrowError(new NotFoundException('not found package to buy'));
  });

  it('validateData - user is not created from Locamos', async () => {
    await expect(
      getEmptyFlowInstance().validateData({
        location: (() => {
          const loc = new Location();
          loc.status = LocationStatus.APPROVED;

          return loc;
        })(),
        pkg: (() => {
          const pkg = new Package();
          pkg.price_usd = 5000;

          return pkg;
        })(),
      } as PrepareOrder),
    ).rejects.toThrowError(
      new NotFoundException('User is not created from LocaMos'),
    );
  });
});

function getEmptyFlowInstance(
  user?,
  mockHttpService?,
): OrdersCheckoutImplementorPoint {
  return new OrdersCheckoutImplementorPoint(
    null,
    null,
    user,
    null,
    null,
    null,
    null,
  );
}
