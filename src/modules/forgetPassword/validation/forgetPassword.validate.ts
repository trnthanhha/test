import {
    IsNotEmpty,
    IsEmail,
    MaxLength,
    IsString,
    MinLength,
} from 'class-validator';

export class ForgetPasswordValidation {
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(100)
    readonly email: string;
}

export class ChangePasswordValidation{
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(30)
    readonly password: string;
}