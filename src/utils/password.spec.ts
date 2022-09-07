import { hashPassword } from './password';

describe('Password utility', () => {
  it('should be equal', () => {
    expect(hashPassword('12345')).toEqual(
      'd70d88cd9adf9f928472cc95f58b1415a985df03f4e23841304ea1d1db05433e',
    );
  });
});
