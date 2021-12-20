import { UserEntity } from 'src/modules/user/user.schema';
import { Document } from 'mongoose';
import { IRoleDocument } from 'src/modules/role/role.interface';

export type UserDocument = UserEntity & Document;

export interface IUserDocument extends Omit<UserDocument, 'role'> {
    role: IRoleDocument;
}

export interface IUserCreate {
    firstName: string;
    lastName?: string;
    password: string;
    email: string;
    phone: string;
    role: string;
}

export interface IUserUpdatePassword {
    passwordNew: string;
    password: string;
}

export type IUserUpdate = Pick<IUserCreate, 'firstName' | 'lastName' | 'phone'>;

