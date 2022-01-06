import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ITypeBaseDocument, ITypeBaseCreate, ITypeBaseUpdate } from "./typebase.interface";
import { TypeBaseEntity } from "./typebase.schema";

@Injectable()
export class TypeBaseService{
    constructor(
        @InjectModel(TypeBaseEntity.name)
        private readonly typeBaseModel: Model<ITypeBaseDocument>,
    ) {}
    async findAll(): Promise<ITypeBaseDocument> {
        return this.typeBaseModel.find({}).lean();
    }

    async findOneById(_id: string): Promise<ITypeBaseDocument> {
        return this.typeBaseModel.findOne({_id}).lean();
    }

    async create(entity: ITypeBaseCreate): Promise<ITypeBaseDocument> {
        const create: ITypeBaseDocument = await new this.typeBaseModel(
            entity
        );
        return create.save();
    }
    
    async updateOneById(
        _id: string,
        data: ITypeBaseUpdate
    ): Promise<ITypeBaseDocument> {
        return await this.typeBaseModel.updateOne(
            {
                _id: new Types.ObjectId(_id)
            },
            data
        );
    }

    async deleteOneById(_id: string): Promise<boolean> {
        return this.typeBaseModel.deleteOne({
            _id: new Types.ObjectId(_id)
        });
    }
}