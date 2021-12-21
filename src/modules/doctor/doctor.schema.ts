import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false })
export class DoctorEntity {
    @Prop({
        required: true,
        index: true,
        trim: true
    })
    email: string;

    @Prop({
        required: true,
        trim: true
    })
    password: string;

    @Prop({
        required: true,
        index: true,
    })
    name: string;

    @Prop({
        required: true
    })
    type_base: string; // loại hình cơ sở sau -> ObjId

    @Prop({
        required: true
    })
    exam_place: string; // đơn vị công tác sau -> ObjId

    @Prop({
        required: true
    })
    education: string; // học hàm học vị sau -> ObjId

    @Prop({
        required: true
    })
    department: string; // khoa phòng sau -> ObjId

    @Prop({
        default: true // set tạm
    })
    isActive: boolean;
}

export const DoctorDatabaseName = 'doctors';
export const DoctorSchema = SchemaFactory.createForClass(DoctorEntity);
