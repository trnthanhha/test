import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false })
export class DepartmentEntity {
    @Prop({
        required: true,
        trim: true,
    })
    name: string;
}

export const DepartmentDatabaseName = 'departments';
export const DepartmentSchema = SchemaFactory.createForClass(DepartmentEntity);
