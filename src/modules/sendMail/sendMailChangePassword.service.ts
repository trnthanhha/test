import { Injectable } from '@nestjs/common';
import { ENUM_SENDMAIL_CONSTANT } from './sendMail.constant';
import { SendMailServiceStrategy } from './sendMailServiceStrategy.abtract';
import { ISendMail } from './senMail.interface';

@Injectable()
export class SendMailChangePassword extends SendMailServiceStrategy {
    private response: ISendMail;
    async sendMail(
        toEmail: string,
        token: string = undefined,
        url?: string,
    ): Promise<ISendMail> {
        const mailOptions = {
            from: process.env.EMAIL_USER as string,
            to: toEmail,
            subject: 'Change Password',
            html: `<h1><a href="${
                url ? url : process.env.URL_CALLBACK_FORGET_PASSWORD
            }?${token}">${ENUM_SENDMAIL_CONSTANT.CHANGE_PASSWORD}</a></h1>`
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
