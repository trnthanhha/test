import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import {
  i18nValidationErrorFactory,
  I18nValidationExceptionFilter,
} from 'nestjs-i18n';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './utils/https.exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  if (!process.env.APP_ENV) {
    throw new Error('APP ENV is not configured');
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // --- PREPARE Micro serivices
  await Promise.all([initRedis(app), initRabbitMQ(app)]);
  await app.startAllMicroservices();

  // --- PREPARE API
  app.enableCors({ origin: process.env.APP_URL || '*' });
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
    .setTitle('LocaMos')
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

async function initRedis(app: NestExpressApplication) {
  await app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      host: 'localhost',
      port: 6379,
    },
  });
}

async function initRabbitMQ(app: NestExpressApplication) {
  const config: ConfigService<unknown, boolean> = app.get(ConfigService);
  const rbUser: string = config.get<string>('RABBITMQ_DEFAULT_USER');
  const rbPass: string = config.get<string>('RABBITMQ_DEFAULT_PASS');
  const rbHost: string = config.get<string>('RABBITMQ_HOST');
  const rbPort: string = config.get<string>('RABBITMQ_PORT');
  const rbQueueName: string = config.get<string>('RABBITMQ_QUEUE_NAME');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://${rbUser}:${rbPass}@${rbHost}:${rbPort}`],
      queue: rbQueueName,
      noAck: false,
      queueOptions: {
        durable: true,
        persistent: true,
      },
    },
  });
}

bootstrap();
