import { IsString, IsNotEmpty } from 'class-validator';

export class EducationCreateValidation {
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}
