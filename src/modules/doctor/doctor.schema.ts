import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DepartmentEntity } from '../department/department.schema';
import { EducationEntity } from '../education/education.schema';
import { ExamplaceEntity } from '../examplace/examplace.schema';
import { TypeBaseEntity } from '../typebase/typebase.schema';

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
        required: true,
        type: Types.ObjectId,
        ref: TypeBaseEntity.name,
    })
    type_base: string;

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: ExamplaceEntity.name,
    })
    exam_place: string;

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: EducationEntity.name,
    })
    education: string;

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: DepartmentEntity.name,
    })
    department: string;

    @Prop({
        default: false
    })
    isActive: boolean;
}

export const DoctorDatabaseName = 'doctors';
export const DoctorSchema = SchemaFactory.createForClass(DoctorEntity);
