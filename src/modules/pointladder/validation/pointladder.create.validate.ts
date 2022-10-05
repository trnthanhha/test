import {IsObject, IsMongoId, IsNotEmpty, IsArray } from 'class-validator';

export class PointLadderCreateValidation {
    @IsArray()
    readonly assessment: [
        {
            type: Record<string, any>
        }
    ];

    @IsMongoId()
    @IsNotEmpty()
    readonly patient_id: string
}
