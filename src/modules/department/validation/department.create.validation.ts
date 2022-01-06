import { IsString, IsNotEmpty } from 'class-validator';

export class DepartmentCreateValidation {
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}
