import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  isPhoneNumber,
  isEmail,
} from 'class-validator';

@ValidatorConstraint()
export class IsPhoneOrEmailConstraint implements ValidatorConstraintInterface {
  validate(userName: any, args: ValidationArguments) {
    return isPhoneNumber(userName, 'VN') || isEmail(userName);
  }
}

export function IsPhoneOrEmail(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPhoneOrEmailConstraint,
    });
  };
}
