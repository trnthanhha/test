import { Injectable } from '@nestjs/common';
import { ENUM_SENDMAIL_CONSTANT } from './sendMail.constant';
import { SendMailServiceStrategy } from './sendMailServiceStrategy.abtract';
import { ISendMail } from './senMail.interface';

@Injectable()
export class SendMailActiveAndUnActiveUser extends SendMailServiceStrategy {
    private response: ISendMail;
    async sendMail(
        toEmail: string,
        data: string
    ): Promise<ISendMail> {
        const mailOptions = {
            from: process.env.EMAIL_USER as string,
            to: toEmail,
            subject: ENUM_SENDMAIL_CONSTANT.REGISTER_SUBJECT,
            html: `<p>${data}</p>`
        };

        await this.transporter
            .sendMail(mailOptions)
            .then((data) => {
                this.response = {
                    status: true,
                    message: data.response
                };
            })
            .catch((error) => {
                this.response = {
                    status: false,
                    message: error.message
                };
            });

        return this.response;
    }
}
