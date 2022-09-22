import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { RabbitMQServices } from './webhook.types';

export const GetVNPayConsumerProvider = () => {
  return {
    provide: RabbitMQServices.VNPay,
    useFactory: (configService: ConfigService) => {
      return getVNPayConsumerClient(configService);
    },
    inject: [ConfigService],
  };
};

const getVNPayConsumerClient = (configService: ConfigService) => {
  const user = configService.get('RABBITMQ_DEFAULT_USER');
  const password = configService.get('RABBITMQ_DEFAULT_PASS');
  const host = configService.get('RABBITMQ_HOST');
  const queueName = configService.get('RABBITMQ_QUEUE_NAME');

  return ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://${user}:${password}@${host}`],
      queue: queueName,
      queueOptions: {
        durable: true,
      },
    },
  });
};
