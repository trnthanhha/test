import nodemailer from 'nodemailer';
import { ISendMail, ISendMailService } from './senMail.interface';

export abstract class sendMailServiceStrategy implements ISendMailService {
    protected transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    abstract sendMail(
        toEmail: string,
        token: string | undefined
    ): Promise<ISendMail>;
}
