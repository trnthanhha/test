import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument } from '../user/user.interface';
import { UserEntity } from '../user/user.schema';

@Injectable()
export class ForgetPasswordService {
    constructor(
        @InjectModel(UserEntity.name)
        private readonly userModel: Model<UserDocument>
    ) {}
    async updateOneById(_id: string, password: string): Promise<UserDocument> {
        return this.userModel.updateOne(
            {
                _id: new Types.ObjectId(_id)
            },
            {
                password
            }
        );
    }
}
