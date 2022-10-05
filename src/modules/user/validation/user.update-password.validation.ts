import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UserUpdatePasswordValidation {
    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    passwordNew: string;
}
