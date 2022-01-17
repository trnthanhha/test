import {
    IsString,
    IsNotEmpty,
    MaxLength,
    MinLength,
    IsArray,
    IsMongoId,
    IsEmail,
    IsEmpty,
    IsOptional
} from 'class-validator';

export class DoctorUpdateProfileValidation {
    @IsEmail()
    @IsOptional()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(30)
    @IsOptional()
    readonly password: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    readonly name: string;

    @IsString()
    @IsMongoId()
    @IsOptional()
    readonly type_base: string;

    @IsString()
    @IsMongoId()
    @IsOptional()
    readonly exam_place: string;

    @IsString()
    @IsMongoId()
    @IsOptional()
    readonly education: string;

    @IsString()
    @IsMongoId()
    @IsOptional()
    readonly department: string;

    @IsString()
    @IsOptional()
    readonly url: string;

    @IsEmpty()
    readonly isActive: boolean
}
