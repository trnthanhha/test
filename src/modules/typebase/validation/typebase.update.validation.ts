import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TypeBaseUpdateValidation {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly name: string;
}
