import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false })
export class EducationEntity {
    @Prop({
        required: true,
        trim: true,
    })
    name: string;
}

export const EducationDatabaseName = 'educations';
export const EducationSchema = SchemaFactory.createForClass(EducationEntity);
