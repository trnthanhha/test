import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Prehistoric {
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
    allergys: [
        {
            type: string,
            decrpition: string 
        }
    ];

    @Prop({
        required: true,
        type: Array,
        default: []
    })
    surgerys: [
        {
            type: string,
            date: string,
            decrpition: string 
        }
    ];

    @Prop({
        required: true,
        type: Array,
        default: []
    })
    disabilities: [
        {
            type: string,
            time: string,
            decrpition: string 
        }
    ];

    @Prop({
        required: true,
        type: Array,
        default: []
    })
    use_medicine: [
        {
            type: string,
            time_start: string,
            total_time: string,
            decrpition: string 
        }
    ];

    @Prop({
        required: true,
        type: Array,
        default: []
    })
    diseases: [
        {
            type: string,
            time_start: string,
            status: string,
            Stage: number,
            decrpition: string 
        }
    ];

    @Prop({
        required: true,
        type: Boolean,
        default: 'false'
    })
    prehistoric: boolean;

}

export const PrehistoricDatabaseName = 'prehistoric';
export const PrehistoricSchema = SchemaFactory.createForClass(Prehistoric);
