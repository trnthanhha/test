import { UserEntity } from '../user/user.schema';
import { Document } from 'mongoose';

export type ForgetDocument = UserEntity & Document;

export interface IForgetDocument extends Pick<UserEntity, 'email'> {
    email: string;
}
