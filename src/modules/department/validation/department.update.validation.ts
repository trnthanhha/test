import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DepartmentUpdateValidation {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly name: string;
}
