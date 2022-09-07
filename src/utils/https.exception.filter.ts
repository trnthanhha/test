import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const { statusCode, message, error }: any = exception.getResponse();

    let nMessage: string = message;

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      nMessage = 'Too Many Requests';
    }

    response.status(status).json({
      statusCode,
      message: error,
      errors: [nMessage],
    });
  }
}
