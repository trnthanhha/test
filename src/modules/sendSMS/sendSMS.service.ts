import { Injectable } from '@nestjs/common';
import Nexmo from 'nexmo';

@Injectable()
export class SendSMSService {
    private nexmo = new Nexmo({
        apiKey: process.env.NEXMO_API_KEY,
        apiSecret: process.env.NEXMO_API_SECRET
    });
    async sendSMS(phone: string, text: string): Promise<void> {
        const matchPhone  = phone[0] === '0' ? '84'+ phone.slice(1) : phone    
        this.nexmo.message.sendSms(
            process.env.NANE_SMS || 'TEST',
            matchPhone,
            text,
            {
                type: 'unicode'
            },
            (err, responseData) => {
                if (err) {
                    console.log(err); // log test
                } else {
                    if (responseData.messages[0]['status'] === '0') {
                        console.log('Message sent successfully.');
                    } else {
                        console.log(
                            `Message failed with error: ${responseData.messages[0]['error-text']}`
                        );
                    }
                }
            }
        );
    }
}
