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
    @IsMongoId()
    readonly type_base: string;

    @IsString()
    @IsMongoId()
    readonly exam_place: string;

    @IsString()
    @IsMongoId()
    readonly education: string;

    @IsString()
    @IsMongoId()
    readonly department: string;
}
