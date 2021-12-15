import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class PatientEntity {
    @Prop({
        required: true,
        index: true,
        trim: true
    })
    firstName: string;

    @Prop({
        required: true,
        index: true,
        trim: true
    })
    lastName: string;

    @Prop({
        required: false
    })
    birthday: Date;

    @Prop({
        required: true
    })
    gender: boolean;

    @Prop({
        required: false
    })
    address: string;

    @Prop({
        required: false
    })
    cmt: string;

    @Prop({
        required: true
    })
    phone: number;

    @Prop({
        required: false
    })
    email: string;

    @Prop({
        required: false
    })
    avatar: string;

    @Prop({
        required: false
    })
    education: string;

    @Prop({
        required: true
    })
    isActive: boolean;
}

export const PatientDatabaseName = 'patients';
export const PatientSchema = SchemaFactory.createForClass(PatientEntity);
