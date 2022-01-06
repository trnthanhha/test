import {
    IsString,
    IsNotEmpty,
    IsIn,
    IsOptional,
    ValidateIf
} from 'class-validator';
import { ENUM_EXAMPLACE_TYPE } from '../examplace.constant';

export class ExamplaceUpdateValidation {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly address: string;

    @IsString()
    @IsOptional()
    @IsIn(Object.values(ENUM_EXAMPLACE_TYPE))
    readonly type: string;
}
