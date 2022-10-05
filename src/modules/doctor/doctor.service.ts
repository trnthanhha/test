import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IErrors } from 'src/error/error.interface';
import { Helper } from 'src/helper/helper.decorator';
import { HelperService } from 'src/helper/helper.service';
import { Message } from 'src/message/message.decorator';
import { MessageService } from 'src/message/message.service';
import { DepartmentEntity } from '../department/department.schema';
import { EducationEntity } from '../education/education.schema';
import { ExamplaceEntity } from '../examplace/examplace.schema';
import { TypeBaseEntity } from '../typebase/typebase.schema';
import { IDoctorCreate, DoctorDocument, IActiveDoctor, IDoctorUpdate } from './doctor.interface';
import { DoctorEntity } from './doctor.schema';

@Injectable()
export class DoctorService {
    constructor(
        @InjectModel(DoctorEntity.name)
        private readonly doctorModel: Model<DoctorDocument>,
        @Helper() private readonly helperService: HelperService,
        @Message() private readonly messageService: MessageService
    ) {}

    async findAll<T>(
        find?: Record<string, any>,
        options?: Record<string, any>
    ): Promise<T[]> {
        const doctors = this.doctorModel
        .find(find)
        .skip(options && options.skip ? options.skip : 0);

    if (options && options.limit) {
        doctors.limit(options.limit);
    }

    if (options && options.sort) {
        doctors.sort(options.sort);
    }

    if (options && options.populate) {
        doctors
            .populate({
                path: 'type_base',
                model: TypeBaseEntity.name
            })
            .populate({
                path: 'exam_place',
                model: ExamplaceEntity.name
            })
            .populate({
                path: 'education',
                model: EducationEntity.name
            }).populate({
                path: 'department',
                model: DepartmentEntity.name
            });
    }

    return doctors.lean();
    }

    async findOne<T>(
        find?: Record<string, any>,
    ): Promise<T> {
        const doctor = this.doctorModel.findOne(find);
        return doctor.lean();
    }

    async checkExist(email: string): Promise<IErrors[]> {
        const existEmail: DoctorDocument = await this.doctorModel
            .findOne({
                email: email
            })
            .lean();

        const errors: IErrors[] = [];
        if (existEmail) {
            errors.push({
                message: this.messageService.get('doctor.error.emailExist'),
                property: 'email'
            });
        }

        return errors;
    }

    async create(entity: IDoctorCreate): Promise<DoctorDocument> {
        const salt: string = await this.helperService.randomSalt();
        const passwordHash = await this.helperService.bcryptHashPassword(
            entity.password,
            salt
        );

        const newDoctor = {
            ...entity,
            password: passwordHash
        } as DoctorEntity;

        const create: DoctorDocument = new this.doctorModel(newDoctor);
        return create.save();
    }

    async getTotalData(find: Record<string, any>): Promise<number> {
        return this.doctorModel.countDocuments(find);
    }

    async updateOneById(
        _id: string,
        data: IDoctorUpdate
    ): Promise<DoctorDocument> {
        return await this.doctorModel.updateOne(
            {
                _id: new Types.ObjectId(_id)
            },
            data
        );
    }
}
