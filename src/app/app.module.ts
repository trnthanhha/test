import { Module } from '@nestjs/common';
import { AppController } from 'src/app/app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseService } from 'src/database/database.service';
import { DatabaseModule } from 'src/database/database.module';
import { MessageModule } from 'src/message/message.module';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { DebuggerService } from 'src/debugger/debugger.service';
import { DebuggerModule } from 'src/debugger/debugger.module';
import { UserModule } from 'src/modules/user/user.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PatientModule } from 'src/modules/patient/patient.module';
import { DoctorModule } from 'src/modules/doctor/doctor.module';
import { PaginationModule } from 'src/pagination/pagination.module';
import { MiddlewareModule } from 'src/middleware/middleware.module';
import { SeedsModule } from 'src/database/seeds/seeds.module';
import Configs from 'src/config/index';
import { HelperModule } from 'src/helper/helper.module';
import { RoleModule } from 'src/modules/role/role.module';
import { PermissionModule } from 'src/modules/permission/permission.module';
import { ExamplaceModule } from 'src/modules/examplace/examplace.module';
import { ForgetPasswordModule } from 'src/modules/forgetPassword/forgetPassword.module';
import { SendMailModule } from 'src/modules/sendMail/sendMail.module';
import { AppointmentModule } from 'src/modules/appointment/appointment.module';
import { SendSMSModule } from 'src/modules/sendSMS/sendSMS.module';
import { ExamRecordModule } from 'src/modules/examRecord/examRecord.module';
// import { KafkaProducerModule } from 'src/kafka/producer/kafka.producer.module';
// import { KafkaConsumerModule } from 'src/kafka/consumer/consumer.module';
// import { KafkaAdminModule } from 'src/kafka/admin/kafka.admin.module';

@Module({
    controllers: [AppController],
    providers: [],
    imports: [
        MiddlewareModule,
        ConfigModule.forRoot({
            load: Configs,
            ignoreEnvFile: false,
            isGlobal: true,
            cache: true
        }),
        WinstonModule.forRootAsync({
            inject: [DebuggerService],
            imports: [DebuggerModule],
            useFactory: (loggerService: DebuggerService) =>
                loggerService.createLogger()
        }),
        MongooseModule.forRootAsync({
            inject: [DatabaseService],
            imports: [DatabaseModule],
            useFactory: (databaseService: DatabaseService) =>
                databaseService.createMongooseOptions()
        }),
        MessageModule,
        DebuggerModule,
        PaginationModule,
        HelperModule,
        SeedsModule,
        SendMailModule,
        SendSMSModule,
        // KafkaAdminModule,
        // KafkaProducerModule,
        // KafkaConsumerModule,

        AuthModule,
        UserModule,
        RoleModule,
        PermissionModule,
        PatientModule,
        DoctorModule,
        ExamplaceModule,
        ForgetPasswordModule,
        AppointmentModule,
        ExamRecordModule
    ]
})
export class AppModule {}
