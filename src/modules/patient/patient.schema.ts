import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false })
export class PatientEntity {
    @Prop({
        required: true,
        index: true,
        trim: true
    })
    name: string;

    @Prop({
        required: false,
    })
    numberProfile: string;

    @Prop({
        required: false
    })
    preferredHand: string;

    @Prop({
        required: false
    })
    nation: string;


    @Prop({
        required: false
    })
    birthday: Date;

    @Prop({
        required: false
    })
    gender: boolean;

    @Prop({
        required: true,
    })
    address: string;

    @Prop({
        unique: true,
        required: true,
        trim: true
    })
    phone: string;

    @Prop({
        required: true,
        trim: true
    })
    email: string;

    @Prop({
        required: true
    })
    job: string;

    @Prop({
        required: false
    })
    education: string;

    @Prop({
        required: false
    })
    nationality: string;

    @Prop({
        required: false
    })
    relative_patient: string;

    @Prop({
        required: false
    })
    relative_name: string;

    @Prop({
        required: false
    })
    relative_phone: string;
}

export const PatientDatabaseName = 'patients';
export const PatientSchema = SchemaFactory.createForClass(PatientEntity);
