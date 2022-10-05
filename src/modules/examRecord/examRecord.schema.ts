import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false })
export class ExamRecordEntity {
    @Prop({
        required: true,
        index: true,
        trim: true,
    })
    type: string;
    @Prop()
    options: []
}

export const ExamRecordDatabaseName = 'examRecords';
export const ExamRecordSchema = SchemaFactory.createForClass(ExamRecordEntity);
