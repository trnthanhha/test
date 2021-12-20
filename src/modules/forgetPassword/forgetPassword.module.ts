import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { SendMailModule } from '../sendMail/sendMail.module';
import { UserModule } from '../user/user.module';
import { UserDatabaseName, UserEntity, UserSchema } from '../user/user.schema';
import { ForgetPasswordController } from './forgetPassword.controller';
import { ForgetPasswordService } from './forgetPassword.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: UserEntity.name,
                schema: UserSchema,
                collection: UserDatabaseName
            }
        ]),
        UserModule,
        AuthModule,
        SendMailModule
    ],
    exports: [ForgetPasswordService],
    providers: [ForgetPasswordService],
    controllers: [ForgetPasswordController]
})
export class ForgetPasswordModule {}
