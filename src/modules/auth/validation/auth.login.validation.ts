import {
    IsNotEmpty,
    IsEmail,
    MaxLength,
    IsBoolean,
    IsOptional,
    IsString,
    IsMongoId
} from 'class-validator';

export class AuthLoginValidation {
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(100)
    readonly email: string;

    @IsOptional()
    @IsBoolean()
    readonly rememberMe?: boolean;

    @IsString()
    readonly password: string;

    @IsMongoId()
    @IsOptional()
    readonly exam_place: string;
}
