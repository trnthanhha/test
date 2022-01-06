import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class RefreshTokenEntity {
    @Prop({
        required: true,
        trim: true,
        type: Types.ObjectId,
        unique: true
    })
    id_user: Types.ObjectId;

    @Prop({
        required: true,
        trim: true,
        unique: true
    })
    refresh_token: string;
}

export const RefreshTokenDatabaseName = 'refreshtokens';
export const RefreshTokenSchema = SchemaFactory.createForClass(
    RefreshTokenEntity
);
