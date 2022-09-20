import { PaymentVendorAdapters } from './payment.vendor.adapters';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import querystring from 'qs';
import { Order } from '../entities/order.entity';

const config = new ConfigService();

export class PaymentVNPayImplementor implements PaymentVendorAdapters {
  generateURLRedirect(order: Order, clientUnique: string): string {
    const ipAddr = clientUnique || '192.168.1.232';

    const tmnCode = config.get<string>('VNP_TmnCode');
    const secretKey = config.get<string>('VNP_HashSecret');
    let vnpUrl = config.get<string>('VNP_Url');
    const returnUrl = config.get<string>('VNP_ReturnUrl');

    const localTime = new Date();
    const date = Date.UTC(
      localTime.getFullYear(),
      localTime.getMonth(),
      localTime.getDate(),
      localTime.getHours(),
      localTime.getMinutes(),
      localTime.getSeconds(),
    );
    const createDate = getDateTimeFormat(new Date(date));
    const amount = order.price;

    const orderInfo = order.note;
    const orderType = 'billpayment';
    const locale = 'vn';
    const currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = order.id;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    vnp_Params['vnp_SecureHash'] = hmac
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    return vnpUrl;
  }
}

function sortObject(obj) {
  const sorted = {};
  const str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

export function getDateTimeFormat(date: Date): string {
  const isoParts = date.toISOString().split('T');
  const dateParts = isoParts[0].split('-');
  const timeParts = isoParts[1].split('.')[0].split(':');

  return dateParts.join('') + timeParts.join('');
}
