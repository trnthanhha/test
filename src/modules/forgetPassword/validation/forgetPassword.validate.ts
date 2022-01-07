import {
    IsNotEmpty,
    IsEmail,
    MaxLength,
    IsString,
    MinLength,
    IsMongoId,
} from 'class-validator';

export class ForgetPasswordValidation {
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(100)
    readonly email: string;

    @IsMongoId()
    @IsNotEmpty()
    readonly exam_place: string

}

export class ChangePasswordValidation{
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(30)
    readonly password: string;
}