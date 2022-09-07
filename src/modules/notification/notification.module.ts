import { DeviceModule } from '@modules/device/device.module';
import User from '@modules/user/entities/user.entity';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Notification from './entities/notification.entity';
import NotificationTemplate from './entities/notificationTemplate.entitiy';
import NotificationTopic from './entities/notificationTopic.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      NotificationTopic,
      NotificationTemplate,
      User,
    ]),
    UserModule,
    DeviceModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
