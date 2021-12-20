import { Module } from '@nestjs/common';
import { SendMailChangePassword } from './sendMailChangePassword.service';

@Module({
    providers: [SendMailChangePassword],
    exports: [SendMailChangePassword]
})
export class SendMailModule {}
