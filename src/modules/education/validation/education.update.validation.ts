import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class EducationUpdateValidation {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly name: string;
}
