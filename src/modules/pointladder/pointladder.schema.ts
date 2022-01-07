import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false })
export class PointLadderEntity {
    @Prop({
        required: true,
        index: true,
        trim: true,
    })
    type: string;
    @Prop()
    options: []
}

export const PointLadderDatabaseName = 'pointladders';
export const PointLadderSchema = SchemaFactory.createForClass(PointLadderEntity);
