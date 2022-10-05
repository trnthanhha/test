import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false })
export class TypeBaseEntity {
    @Prop({
        required: true,
        trim: true,
    })
    name: string;
}

export const TypeBaseDatabaseName = 'typebases';
export const TypeBaseSchema = SchemaFactory.createForClass(TypeBaseEntity);
