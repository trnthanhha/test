import { IsBoolean, IsEmpty, IsOptional, IsString } from 'class-validator';

export class DoctorUpdateActiveAndUnActiveValidation {
    @IsBoolean()
    @IsOptional()
    readonly isActive: boolean;

    @IsString()
    readonly conten: string;

    @IsEmpty()
    readonly email: string;

    @IsEmpty()
    readonly password: string;

    @IsEmpty()
    readonly name: string;

    @IsEmpty()
    readonly type_base: string;

    @IsEmpty()
    readonly exam_place: string;

    @IsEmpty()
    readonly education: string;

    @IsEmpty()
    readonly department: string;
}
