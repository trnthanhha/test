import { IsPhoneOrEmailConstraint } from './auth.validator.decorator';

describe('Validate email or phone number', () => {
  let validator;

  beforeAll(() => {
    validator = new IsPhoneOrEmailConstraint();
  });

  it('should be false, invalid phone number', () => {
    expect(validator.validate('+84947754271 | customer@gmail.com')).toEqual(
      false,
    );
  });

  it('should be true, valid phone with +', () => {
    expect(validator.validate('+84947754271')).toEqual(true);
  });
  it('should be true, valid phone with `0``', () => {
    expect(validator.validate('0947754271')).toEqual(true);
  });
  it('should be true, valid phone with space character', () => {
    expect(validator.validate('0947 754 271')).toEqual(true);
  });
  it('should be true, valid email', () => {
    expect(validator.validate('customer@gmail.com')).toEqual(true);
  });
  it('should be true, valid email', () => {
    expect(validator.validate('admin.agiletech.com@gmail.com')).toEqual(true);
  });
});
