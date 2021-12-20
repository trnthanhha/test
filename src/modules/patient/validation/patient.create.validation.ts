import {
    IsString,
    IsNotEmpty,
    MaxLength,
    MinLength,
    IsDateString,
    IsBoolean,
    IsOptional,
    Length
} from 'class-validator';

export class PatientCreateValidation {
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
    @Length(10)
    readonly phone: string

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
