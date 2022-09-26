import { CreateOrderDto } from './dto/create-order.dto';
import { BadRequestException } from '@nestjs/common';
import { OrdersCheckoutImplementorPackage } from './orders.checkout.implementor.package';
import { Location } from '../locations/entities/location.entity';
import { PrepareOrder } from './orders.checkout.types';
import {
  LocationPurchaseStatus,
  LocationStatus,
} from '../locations/locations.contants';
import { UserPackage } from '../user_package/entities/user_package.entity';
import { UPackagePurchaseStatus } from '../user_package/user_package.constants';

describe('Checkout by package', () => {
  it('preValidate - undefined user_package_id', () => {
    const dto = new CreateOrderDto();
    expect(() => {
      getEmptyFlowInstance().preValidate(dto);
    }).toThrowError(BadRequestException);
  });

  it('preValidate - not found user_package_id', () => {
    const dto = new CreateOrderDto();
    dto.user_package_id = -1;
    expect(() => {
      getEmptyFlowInstance().preValidate(dto);
    }).toThrowError(BadRequestException);
  });

  it('validateDate - userPackage undefined', () => {
    const dto = new CreateOrderDto();
    dto.user_package_id = -1;
    expect(() => {
      getEmptyFlowInstance().validateData({} as PrepareOrder);
    }).toThrowError(
      new BadRequestException(
        'User not exist package || zero quantity || package unpaid',
      ),
    );
  });

  it('validateDate - userPackage is not paid', () => {
    const dto = new CreateOrderDto();
    dto.user_package_id = -1;
    expect(() => {
      getEmptyFlowInstance().validateData({
        userPkg: ((): UserPackage => {
          const uPkg = new UserPackage();
          uPkg.purchase_status = UPackagePurchaseStatus.UNAUTHORIZED;

          return uPkg;
        })(),
      } as PrepareOrder);
    }).toThrowError(
      new BadRequestException(
        'User not exist package || zero quantity || package unpaid',
      ),
    );
  });

  it('validateDate - userPackage has no remaining quantity', () => {
    const dto = new CreateOrderDto();
    dto.user_package_id = -1;
    expect(() => {
      getEmptyFlowInstance().validateData({
        userPkg: ((): UserPackage => {
          const uPkg = new UserPackage();
          uPkg.purchase_status = UPackagePurchaseStatus.PAID;

          return uPkg;
        })(),
      } as PrepareOrder);
    }).toThrowError(
      new BadRequestException(
        'User not exist package || zero quantity || package unpaid',
      ),
    );
  });

  it('validateDate - userPackage has no remaining quantity 2', () => {
    const dto = new CreateOrderDto();
    dto.user_package_id = -1;
    expect(() => {
      getEmptyFlowInstance().validateData({
        userPkg: ((): UserPackage => {
          const uPkg = new UserPackage();
          uPkg.purchase_status = UPackagePurchaseStatus.PAID;
          uPkg.remaining_quantity = 0;

          return uPkg;
        })(),
      } as PrepareOrder);
    }).toThrowError(
      new BadRequestException(
        'User not exist package || zero quantity || package unpaid',
      ),
    );
  });

  it('validateData - location is owned', () => {
    expect(() => {
      getEmptyFlowInstance().validateData({
        userPkg: validUserPackage(),
        location: (() => {
          const loc = new Location();
          loc.user_id = 1;

          return loc;
        })(),
      } as PrepareOrder);
    }).toThrowError(new BadRequestException('Location is unable to purchase'));
  });

  it('validateData - location is not paid yet', () => {
    expect(() => {
      getEmptyFlowInstance().validateData({
        userPkg: validUserPackage(),
        location: (() => {
          const loc = new Location();
          loc.purchase_status = LocationPurchaseStatus.FAILED;

          return loc;
        })(),
      } as PrepareOrder);
    }).toThrowError(new BadRequestException('Location is unable to purchase'));
  });

  it('validateData - location is not approved', () => {
    expect(() => {
      getEmptyFlowInstance().validateData({
        userPkg: validUserPackage(),
        location: (() => {
          const loc = new Location();
          loc.status = LocationStatus.PENDING;

          return loc;
        })(),
      } as PrepareOrder);
    }).toThrowError(new BadRequestException('Location is unable to purchase'));
  });

  it('validateData - location is blacklist', () => {
    expect(() => {
      getEmptyFlowInstance().validateData({
        userPkg: validUserPackage(),
        location: (() => {
          const loc = new Location();
          loc.is_blacklist = true;

          return loc;
        })(),
      } as PrepareOrder);
    }).toThrowError(new BadRequestException('Location is unable to purchase'));
  });

  it('validateData - succeeded', () => {
    expect(() => {
      getEmptyFlowInstance().validateData({
        userPkg: validUserPackage(),
        location: (() => {
          const loc = new Location();
          loc.status = LocationStatus.APPROVED;

          return loc;
        })(),
      } as PrepareOrder);
    }).not.toThrowError();
  });
});

function getEmptyFlowInstance(): OrdersCheckoutImplementorPackage {
  return new OrdersCheckoutImplementorPackage(null, null, null, null, null);
}
function validUserPackage(): UserPackage {
  return Object.assign(new UserPackage(), {
    id: 4,
    package_name: 'Premium combo x5',
    version: 2,
    package_id: 2,
    remaining_quantity: 4,
    quantity: 5,
    price: 500,
    purchase_status: UPackagePurchaseStatus.PAID,
  } as UserPackage);
}
