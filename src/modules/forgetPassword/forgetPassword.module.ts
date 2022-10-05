import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { DoctorModule } from '../doctor/doctor.module';
import { DoctorDatabaseName, DoctorEntity, DoctorSchema } from '../doctor/doctor.schema';
import { SendMailModule } from '../sendMail/sendMail.module';
import { UserModule } from '../user/user.module';
import { ForgetPasswordController } from './forgetPassword.controller';
import { ForgetPasswordService } from './forgetPassword.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: DoctorEntity.name,
                schema: DoctorSchema,
                collection: DoctorDatabaseName
            }
        ]),
        UserModule,
        DoctorModule,
        AuthModule,
        SendMailModule
    ],
    exports: [ForgetPasswordService],
    providers: [ForgetPasswordService],
    controllers: [ForgetPasswordController]
})
export class ForgetPasswordModule {}
