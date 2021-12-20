import { Module } from "@nestjs/common";
import { SendSMSService } from "./sendSMS.service";

@Module({
    providers:[SendSMSService],
    exports:[SendSMSService]
})
export class SendSMSModule{}