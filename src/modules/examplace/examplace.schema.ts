import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class ExamplaceEntity {
    @Prop({
        required: true,
        index: true,
        trim: true
    })
    name: string;

    @Prop({
        required: false,
        trim: true
    })
    desc: string;

    @Prop({
        required: true,
        trim: true
    })
    businessLicense: string;

    @Prop({
        required: true
    })
    type: boolean;

    @Prop({
        required: false
    })
    address: string;

    @Prop({
        required: true
    })
    isActive: boolean;
}

export const ExamplaceDatabaseName = 'examplaces';
export const ExamplaceSchema = SchemaFactory.createForClass(ExamplaceEntity);
