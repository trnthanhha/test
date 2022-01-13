import {
    IsNotEmpty,
    IsEmail,
    MaxLength,
    IsString,
    MinLength,
    IsMongoId,
    IsOptional,
} from 'class-validator';

export class ForgetPasswordValidation {
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(100)
    readonly email: string;

    @IsMongoId()
    @IsNotEmpty()
    readonly exam_place: string

    @IsString()
    @IsOptional()
    readonly url: string
}

export class ChangePasswordValidation{
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(30)
    readonly password: string;
}