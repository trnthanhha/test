import {
    IsString,
    IsNotEmpty,
    IsIn
} from 'class-validator';
import { ENUM_EXAMPLACE_TYPE } from '../examplace.constant';

export class ExamplaceCreateValidation {
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    readonly address: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(Object.values(ENUM_EXAMPLACE_TYPE))
    readonly type: string;
}
