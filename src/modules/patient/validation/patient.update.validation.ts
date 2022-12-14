import {
    IsBoolean,
    IsDateString,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    MaxLength,
    MinLength
} from 'class-validator';

export class PatientUpdateValidation {
    @IsString()
    @IsOptional()
    readonly numberProfile?: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    readonly name: string;

    @IsDateString()
    @IsOptional()
    readonly birthday?: Date

    @IsString()
    @IsOptional()
    readonly preferredHand?: string

    @IsString()
    @IsOptional()
    readonly nation?: string

    @IsBoolean()
    @IsOptional()
    readonly gender?: boolean

    @IsString()
    @IsNotEmpty()
    readonly address: string

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    phone: string

    @IsString()
    @IsNotEmpty()
    readonly email: string;

    @IsString()
    @IsOptional()
    readonly education?: string;

    @IsString()
    @IsOptional()
    readonly nationality?: string;

    @IsString()
    @IsOptional()
    readonly job: string;

    @IsString()
    @IsOptional()
    readonly relative_patient?: string;

    @IsString()
    @IsOptional()
    readonly relative_name?: string;

    @IsString()
    @IsOptional()
    readonly relative_phone?: string;
}
