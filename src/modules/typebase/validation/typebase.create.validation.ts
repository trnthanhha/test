import { IsString, IsNotEmpty } from 'class-validator';

export class TypeBaseCreateValidation {
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}
