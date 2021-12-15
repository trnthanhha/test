import {
    IsString,
    IsNotEmpty,
    MaxLength,
    MinLength,
    IsArray,
    IsMongoId
} from 'class-validator';

export class PatientCreateValidation {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    readonly firstName: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    readonly lastName: string;
}
