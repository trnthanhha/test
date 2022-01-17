import { Module } from '@nestjs/common';
import { SendMailActiveAndUnActiveUser } from './sendMailActiveAndUnActiveUser.service';
import { SendMailChangePassword } from './sendMailChangePassword.service';

@Module({
    providers: [SendMailChangePassword, SendMailActiveAndUnActiveUser],
    exports: [SendMailChangePassword, SendMailActiveAndUnActiveUser]
})
export class SendMailModule {}
