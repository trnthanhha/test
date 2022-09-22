import { GetVNPayConsumerProvider } from './webhook.vnpay.client';
import { RabbitMQServices } from './webhook.types';

export class WebhookFactory {
  static Build(serviceName: string) {
    switch (serviceName) {
      case RabbitMQServices.VNPay:
        return GetVNPayConsumerProvider();
    }
  }
}
