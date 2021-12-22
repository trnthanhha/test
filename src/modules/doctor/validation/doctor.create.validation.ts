import {
    IsString,
    IsNotEmpty,
    MaxLength,
    MinLength,
    IsArray,
    IsMongoId,
    IsEmail
} from 'class-validator';

export class DoctorCreateValidation {
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(30)
    readonly password: string;

    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    readonly type_base: string;

    @IsString()
    @IsNotEmpty()
    readonly exam_place: string;

    @IsString()
    @IsNotEmpty()
    readonly education: string;

    @IsString()
    @IsNotEmpty()
    readonly department: string;
}
