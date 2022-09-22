import { getDateTimeFormat } from './payment.vnpay.implementor';

describe('VNPay implementor', () => {
  it('parse Date to format yyyymmddHHmmss', () => {
    const forceTime = new Date(Date.UTC(2022, 9, 19, 19, 1, 59));

    const formatParsed = getDateTimeFormat(forceTime);
    expect(formatParsed).toEqual('20221019190159');
  });
});
