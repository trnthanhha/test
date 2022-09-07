import { NestFactory } from '@nestjs/core';
import {Logger, ValidationPipe} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import {
  i18nValidationErrorFactory,
  I18nValidationExceptionFilter,
} from 'nestjs-i18n';
import * as admin from 'firebase-admin';
import { AppModule } from './app.module';
import {HttpExceptionFilter} from "./utils/https.exception.filter";

const serviceAccount = ''

async function bootstrap() {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({ origin: '*' });

  app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: i18nValidationErrorFactory,
        transform: true,
      }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalFilters(
      new I18nValidationExceptionFilter({ detailedErrors: false }),
  );

  const { PORT, APP_URL } = process.env;

  const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('VBike')
      .setDescription('')
      .setVersion('1.0')
      .addTag('auth')
      .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  /**
   * To test websockets chat
   * ${APP_URL}:${PORT}
   * Note: Change url at static/main.js line:29 to match with nest app url
   */
  // app.useStaticAssets(join(__dirname, '..', 'static'));

  await app.listen(PORT);
  Logger.log(`🚀 ~ App running at ${APP_URL}:${PORT}/api`, 'NestApplication');
}
bootstrap();
