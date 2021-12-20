import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity } from 'src/modules/user/user.schema';
import {
    UserDocument,
    IUserDocument,
    IUserCreate,
    IUserUpdate,
    IUserUpdatePassword
} from 'src/modules/user/user.interface';
import { MessageService } from 'src/message/message.service';
import { Message } from 'src/message/message.decorator';
import { RoleEntity } from 'src/modules/role/role.schema';
import { PermissionEntity } from 'src/modules/permission/permission.schema';
import { Types } from 'mongoose';
import { UserProfileTransformer } from './transformer/user.profile.transformer';
import { plainToClass } from 'class-transformer';
import { UserLoginTransformer } from './transformer/user.login.transformer';
import { Helper } from 'src/helper/helper.decorator';
import { HelperService } from 'src/helper/helper.service';
import { IErrors } from 'src/error/error.interface';
import { ENUM_USER_STATUS_CODE_ERROR } from './user.constant';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(UserEntity.name)
        private readonly userModel: Model<UserDocument>,
        @Helper() private readonly helperService: HelperService,
        @Message() private readonly messageService: MessageService
    ) {}

    async findAll<T>(
        find?: Record<string, any>,
        options?: Record<string, any>
    ): Promise<T[]> {
        const findAll = this.userModel
            .find(find)
            .skip(options && options.skip ? options.skip : 0);

        if (options && options.limit) {
            findAll.limit(options.limit);
        }

        if (options && options.sort) {
            findAll.sort(options.sort);
        }

        if (options && options.populate) {
            findAll.populate({
                path: 'role',
                model: RoleEntity.name,
                populate: {
                    path: 'permissions',
                    model: PermissionEntity.name
                }
            });
        }

        return findAll.lean();
    }

    async getTotalData(find?: Record<string, any>): Promise<number> {
        return this.userModel.countDocuments(find);
    }

    async mapProfile(data: IUserDocument): Promise<UserProfileTransformer> {
        return plainToClass(UserProfileTransformer, data);
    }

    async mapLogin(data: IUserDocument): Promise<UserLoginTransformer> {
        return plainToClass(UserLoginTransformer, data);
    }

    async findOneById<T>(
        _id: string,
        options?: Record<string, any>
    ): Promise<T> {
        const user = this.userModel.findById(_id);

        if (options && options.populate) {
            user.populate({
                path: 'role',
                model: RoleEntity.name,
                populate: {
                    path: 'permissions',
                    model: PermissionEntity.name
                }
            });
        }

        return user.lean();
    }

    async findOne<T>(
        find?: Record<string, any>,
        options?: Record<string, any>
    ): Promise<T> {
        const user = this.userModel.findOne(find);

        if (options && options.populate) {
            user.populate({
                path: 'role',
                model: RoleEntity.name,
                populate: {
                    path: 'permissions',
                    model: PermissionEntity.name
                }
            });
        }

        return user.lean();
    }

    async create({
        firstName,
        lastName,
        password,
        email,
        phone,
        role,
    }: IUserCreate): Promise<UserDocument> {
        const salt: string = await this.helperService.randomSalt();
        const passwordHash = await this.helperService.bcryptHashPassword(
            password,
            salt
        );

        const newUser: UserEntity = {
            firstName: firstName.toLowerCase(),
            email: email.toLowerCase(),
            phone: phone,
            password: passwordHash,
            role: new Types.ObjectId(role),
            isActive: true,
            avatar: null
        };

        if (lastName) {
            newUser.lastName = lastName.toLowerCase();
        }

        const create: UserDocument = new this.userModel(newUser);
        return create.save();
    }

    async deleteOneById(_id: string): Promise<boolean> {
        try {
            this.userModel.deleteOne({
                _id: new Types.ObjectId(_id)
            });
            return true;
        } catch (e: unknown) {
            return false;
        }
    }

    async updateOneById(
        _id: string,
        { firstName, lastName, phone }: IUserUpdate
    ): Promise<UserDocument> {
        return this.userModel.updateOne(
            {
                _id: new Types.ObjectId(_id)
            },
            {
                firstName: firstName.toLowerCase(),
                lastName: lastName.toLowerCase()
            }
        );
    }

    async updatePasswordOneById(
        _id: string,
        { password, passwordNew }: IUserUpdatePassword
    ): Promise<UserDocument>{
        const user = this.getUserById(_id);
        const passwordUser = (await user).password
        const passwordHash = await this.helperService.bcryptComparePassword(
            password,
            passwordUser
        );

        if(passwordHash){
            const salt: string = await this.helperService.randomSalt();
            const passwordUpdateHash = await this.helperService.bcryptHashPassword(
                passwordNew,
                salt
            );
            return this.userModel.updateOne(
                {
                    _id: new Types.ObjectId(_id)
                },
                {
                    password: passwordUpdateHash
                }
            );
        }else{
            
            throw new NotFoundException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR,
                message: 'Password current incorrect'
            });
        }
       
    }

    async getUserById(_id: string):Promise<UserDocument> {
        return this.userModel.findOne({_id});
    }

    async checkExist(
        email: string,
        phone: string,
        _id?: string
    ): Promise<IErrors[]> {
        const existEmail: UserDocument = await this.userModel
            .findOne({
                email: email
            })
            .where('_id')
            .ne(new Types.ObjectId(_id))
            .lean();

        const existMobileNumber: UserDocument = await this.userModel
            .findOne({
                phone: phone
            })
            .where('_id')
            .ne(new Types.ObjectId(_id))
            .lean();

        const errors: IErrors[] = [];
        if (existEmail) {
            errors.push({
                message: this.messageService.get('user.error.emailExist'),
                property: 'email'
            });
        }
        if (existMobileNumber) {
            errors.push({
                message: this.messageService.get(
                    'user.error.phoneExist'
                ),
                property: 'phone'
            });
        }

        return errors;
    }

    async deleteMany(find: Record<string, any>): Promise<boolean> {
        try {
            await this.userModel.deleteMany(find);
            return true;
        } catch (e: unknown) {
            return false;
        }
    }
}
