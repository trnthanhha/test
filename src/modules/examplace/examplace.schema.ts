import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ENUM_EXAMPLACE_TYPE } from './examplace.constant';

@Schema({ timestamps: true, versionKey: false })
export class ExamplaceEntity {
    @Prop({
        required: true,
        index: true,
        trim: true
    })
    name: string;

    @Prop({
        required: true,
        enum: ENUM_EXAMPLACE_TYPE
    })
    type: string;

    @Prop({
        required: true,
        trim: true
    })
    address: string;
}

export const ExamplaceDatabaseName = 'examplaces';
export const ExamplaceSchema = SchemaFactory.createForClass(ExamplaceEntity);
