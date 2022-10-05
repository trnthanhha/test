import { Module } from '@nestjs/common';
import { SendMailActiveAndUnActiveUser } from './sendMailActiveAndUnActiveUser.service';
import { SendMailChangeEmail } from './sendMailChangeEmail.service';
import { SendMailChangePassword } from './sendMailChangePassword.service';

@Module({
    providers: [
        SendMailChangePassword,
        SendMailActiveAndUnActiveUser,
        SendMailChangeEmail
    ],
    exports: [
        SendMailChangePassword,
        SendMailActiveAndUnActiveUser,
        SendMailChangeEmail
    ]
})
export class SendMailModule {}
