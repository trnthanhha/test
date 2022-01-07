import { IsString, IsIn } from 'class-validator';

export class PointLadderCreateValidation {
    @IsString()
    readonly type: string;
}
