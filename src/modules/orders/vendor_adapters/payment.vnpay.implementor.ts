import { PaymentVendorAdapters } from './payment.vendor.adapters';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import querystring from 'qs';
import { Order } from '../entities/order.entity';
import { OrderStatusDto } from '../dto/order-status-dto';

const config = new ConfigService();

type VNPayConfig = {
  VNP_TmnCode: string;
  VNP_HashSecret: string;
  VNP_Url: string;
  VNP_ReturnUrl: string;
};

export class PaymentVNPayImplementor implements PaymentVendorAdapters {
  private cf: VNPayConfig;
  constructor() {
    this.cf = {
      VNP_HashSecret: config.get<string>('VNP_HashSecret'),
      VNP_ReturnUrl: config.get<string>('VNP_ReturnUrl'),
      VNP_TmnCode: config.get<string>('VNP_TmnCode'),
      VNP_Url: config.get<string>('VNP_Url'),
    };
  }

  generateURLRedirect(order: Order, ipAddr: string): string {
    let vnpUrl = this.cf.VNP_Url;

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
    vnp_Params['vnp_TmnCode'] = this.cf.VNP_TmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = order.ref_uid;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = this.cf.VNP_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', this.cf.VNP_HashSecret);
    vnp_Params['vnp_SecureHash'] = hmac
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    return vnpUrl;
  }

  decodeResponse(req: any): OrderStatusDto {
    let vnp_Params = req.query;

    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', this.cf.VNP_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash !== signed) {
      return {
        status_code: '97',
        message: 'Kiểm tra GD thất bại',
      } as OrderStatusDto;
    }

    const dto = new OrderStatusDto();
    dto.status_code = vnp_Params['vnp_ResponseCode'];
    switch (vnp_Params['vnp_ResponseCode']) {
      case '00':
        dto.message = 'Giao dịch thành công';
        break;
      case '01':
        dto.message = 'Giao dịch chưa hoàn tất';
        break;
      case '02':
        dto.message = 'Giao dịch bị lỗi';
        break;
      case '04':
        dto.message =
          'Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)';
        break;
      case '05':
        dto.message = 'VNPAY đang xử lý giao dịch này (GD hoàn tiền)';
        break;
      case '06':
        dto.message =
          'VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)';
        break;
      case '07':
        dto.message = 'Giao dịch bị nghi ngờ gian lận';
        break;
      case '09':
        dto.message = 'GD Hoàn trả bị từ chối';
        break;
      default:
        dto.message = 'GD không xác định';
    }

    return dto;
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
