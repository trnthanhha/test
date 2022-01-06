import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { IDepartmentDocument, IDepartmentCreate, IDepartmentUpdate } from "./department.interface";
import { DepartmentEntity } from "./department.schema";

@Injectable()
export class DepartmentService{
    constructor(
        @InjectModel(DepartmentEntity.name)
        private readonly departmentModel: Model<IDepartmentDocument>,
    ) {}
    async findAll(): Promise<IDepartmentDocument> {
        return this.departmentModel.find({}).lean();
    }

    async findOneById(_id: string): Promise<IDepartmentDocument> {
        return this.departmentModel.findOne({_id}).lean();
    }

    async create(entity: IDepartmentCreate): Promise<IDepartmentDocument> {
        const create: IDepartmentDocument = await new this.departmentModel(
            entity
        );
        return create.save();
    }
    
    async updateOneById(
        _id: string,
        data: IDepartmentUpdate
    ): Promise<IDepartmentDocument> {
        return await this.departmentModel.updateOne(
            {
                _id: new Types.ObjectId(_id)
            },
            data
        );
    }

    async deleteOneById(_id: string): Promise<boolean> {
        return this.departmentModel.deleteOne({
            _id: new Types.ObjectId(_id)
        });
    }
}