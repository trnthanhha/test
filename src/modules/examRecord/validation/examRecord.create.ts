import { IsString, IsIn } from 'class-validator';

export class ExamRecordCreateValidation {
    @IsString()
    readonly type: string;
}
