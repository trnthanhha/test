import { PaymentVendorAdapters } from './payment.vendor.adapters';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import querystring from 'qs';
import dateFormat from 'dateformat';
import { Order } from '../entities/order.entity';

const config = new ConfigService();

// Docs: https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/
// All testcase: https://viblo.asia/p/tich-hop-vnpay-vao-rails-924lJ2A8lPM
export class PaymentVNPayImplementor implements PaymentVendorAdapters {
  generateURLRedirect(order: Order, clientUnique: string): string {
    const ipAddr = clientUnique;

    const tmnCode = config.get<string>('VNP_TmnCode');
    const secretKey = config.get<string>('VNP_HashSecret');
    let vnpUrl = config.get<string>('VNP_Url');
    const returnUrl = config.get<string>('VNP_ReturnUrl');

    const date = new Date();

    const createDate = dateFormat(date, 'yyyymmddHHmmss');
    const amount = order.price;

    const orderInfo = order.note;
    const orderType = 'billpayment';
    let locale = 'vn';
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
      .update(new Buffer(signData, 'utf-8'))
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
