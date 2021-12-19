import { IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';

export class UserUpdateValidation {
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    readonly firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    readonly lastName: string;

    
    @IsString()
    @IsNotEmpty()
    readonly phone: string;

}
