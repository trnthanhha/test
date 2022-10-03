import { CheckoutBillAddress } from './checkout-dto';
import { User } from '../../users/entities/user.entity';

describe('Checkout with user info', () => {
  it('isEmpty request', () => {
    expect(CheckoutBillAddress.isEmpty({})).toEqual(true);
  });

  it('not empty request', () => {
    expect(CheckoutBillAddress.isEmpty({ address: 'Ha Noi' })).toEqual(false);
  });

  it('compare match: isEqual === true', () => {
    const user = new User();
    user.phone_number = '123456789';
    user.identification_number = 'CMTND/CCCD';
    user.identification_created_from = 'Nơi cấp';
    user.identification_created_at = new Date('2022-10-03T17:11:33.319Z');
    user.province = 'Tỉnh/Thành phố';
    user.district = 'Quận/Huyện';
    user.address = 'Địa chỉ nhà';
    const prevValue = new CheckoutBillAddress(user);
    const nextValue = new CheckoutBillAddress({
      phone_number: '123456789',
      identification_number: 'CMTND/CCCD',
      identification_created_from: 'Nơi cấp',
      identification_created_at: '2022-10-03T17:11:33.319Z',
      province: 'Tỉnh/Thành phố',
      district: 'Quận/Huyện',
      address: 'Địa chỉ nhà',
    });

    expect(prevValue.isEqualTo(nextValue)).toEqual(true);
  });

  it('compare match: isEqual === true 2', () => {
    const user = new User();
    user.phone_number = '123456789';
    user.district = 'Quận/Huyện';
    user.address = 'Địa chỉ nhà';
    const prevValue = new CheckoutBillAddress(user);
    const nextValue = new CheckoutBillAddress({
      phone_number: '123456789',
      district: 'Quận/Huyện',
      address: 'Địa chỉ nhà',
    });

    expect(prevValue.isEqualTo(nextValue)).toEqual(true);
  });

  it('compare match: isEqual === false', () => {
    const user = new User();
    user.phone_number = '123456789';
    user.district = 'Quận/Huyện';
    user.address = 'Địa chỉ nhà';
    const prevValue = new CheckoutBillAddress(user);
    const nextValue = new CheckoutBillAddress({
      phone_number: '123456789',
      district: 'Quận/Huyện',
      address: 'Địa chỉ nhà 2',
    });

    expect(prevValue.isEqualTo(nextValue)).toEqual(false);
  });
});
