import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PatientEntity } from '../patient/patient.schema';

@Schema({ timestamps: true, versionKey: false })
export class PointLadderEntity {
    @Prop({
        required: true,
        type: []
    })
    assessment: [
        Record<string, any>
    ];
    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: PatientEntity.name,
        index: true,
        unique:true
    })
    patient_id: Types.ObjectId;
}

export const PointLadderDatabaseName = 'pointladders';
export const PointLadderSchema = SchemaFactory.createForClass(PointLadderEntity);
