import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Symptom {
    @Prop({
        required: true,
        index: true,
    })
    patientId: string;

    @Prop({
        required: true,
        type: Array,
        default: []
    })
    symptoms: [
        {
            symptom: string,
            decrpition: string 
        }
    ];

}

export const SymptomDatabaseName = 'symptom';
export const SymptomSchema = SchemaFactory.createForClass(Symptom);
