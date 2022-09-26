import { OrdersCheckoutImplementorCash } from './orders.checkout.implementor.cash';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrepareOrder } from './orders.checkout.types';
import { Location } from '../locations/entities/location.entity';
import {
  LocationPurchaseStatus,
  LocationStatus,
} from '../locations/locations.contants';
import { StandardPrice } from '../standard-price/entities/standard-price.entity';

describe('Checkout by cash', () => {
  it('preValidate', () => {
    const dto = new CreateOrderDto();
    dto.user_package_id = 1;
    expect(() => {
      getEmptyFlowInstance().preValidate(dto);
    }).toThrowError(BadRequestException);
  });

  it('validateData - location is owned', () => {
    expect(() => {
      getEmptyFlowInstance().validateData({
        location: (() => {
          const loc = new Location();
          loc.user_id = 1;

          return loc;
        })(),
      } as PrepareOrder);
    }).toThrowError(BadRequestException);
  });

  it('validateData - location is not paid yet', () => {
    expect(() => {
      getEmptyFlowInstance().validateData({
        location: (() => {
          const loc = new Location();
          loc.purchase_status = LocationPurchaseStatus.FAILED;

          return loc;
        })(),
      } as PrepareOrder);
    }).toThrowError(BadRequestException);
  });

  it('validateData - location is not approved', () => {
    expect(() => {
      getEmptyFlowInstance().validateData({
        location: (() => {
          const loc = new Location();
          loc.status = LocationStatus.PENDING;

          return loc;
        })(),
      } as PrepareOrder);
    }).toThrowError(BadRequestException);
  });

  it('validateData - location is blacklist', () => {
    expect(() => {
      getEmptyFlowInstance().validateData({
        location: (() => {
          const loc = new Location();
          loc.is_blacklist = true;

          return loc;
        })(),
      } as PrepareOrder);
    }).toThrowError(BadRequestException);
  });

  it('validateData - standard price not found', () => {
    expect(() => {
      getEmptyFlowInstance().validateData({
        location: (() => {
          const loc = new Location();
          loc.status = LocationStatus.APPROVED;

          return loc;
        })(),
      } as PrepareOrder);
    }).toThrowError(InternalServerErrorException);
  });

  it('validateData - succeeded', () => {
    expect(() => {
      getEmptyFlowInstance().validateData({
        location: (() => {
          const loc = new Location();
          loc.status = LocationStatus.APPROVED;

          return loc;
        })(),
        stdPrice: (() => {
          const stdPrice = new StandardPrice();
          stdPrice.price = 100;

          return stdPrice;
        })(),
      } as PrepareOrder);
    }).not.toThrow();
  });
});

function getEmptyFlowInstance(): OrdersCheckoutImplementorCash {
  return new OrdersCheckoutImplementorCash(null, null, null, null, null);
}
