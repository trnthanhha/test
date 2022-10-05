export interface ISendMail {
    status: boolean;
    message: string;
}

export interface ISendMailService {
    sendMail(toEmail: string, token: string | undefined): Promise<ISendMail>;
}
