import { Document } from 'mongoose';
import { RefreshTokenEntity } from './auth.schema';

export type IAuthApplyDecorator = <TFunction extends Function, Y>(
    target: Record<string, any> | TFunction,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<Y>
) => void;

export type RefreshTokenDocument = RefreshTokenEntity & Document;

export interface IRefreshTokenCreate {
    id_user: string;
    refresh_token: string;
}
