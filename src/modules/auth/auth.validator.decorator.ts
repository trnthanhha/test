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
  validate(userName: string) {
    const text = userName.trim().replace(new RegExp(' ', 'g'), '');
    const validCharsEmail = text.match(/[0-9a-zA-Z.@]/g)?.join('');
    return (
      IsPhoneOrEmailConstraint.isValidPhone(text) ||
      (isEmail(text) && text === validCharsEmail)
    );
  }

  static isValidPhone(text: string) {
    const validCharsPhone = text.match(/[0-9+-]/g)?.join('');
    return isPhoneNumber(text, 'VN') && validCharsPhone == text;
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

export function Match(property: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }
}
