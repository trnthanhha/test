import { PaymentVendorAdapters } from './payment.vendor.adapters';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import querystring from 'qs';
import { OrderStatusDto } from '../dto/order-status-dto';
import { TransactionInfo } from './payment.types';

const config = new ConfigService();

type VNPayConfig = {
  APP_DOMAIN: string;
  VNP_TmnCode: string;
  VNP_HashSecret: string;
  VNP_Url: string;
  VNP_ReturnRoute: string;
};

export class PaymentVNPayImplementor implements PaymentVendorAdapters {
  private cf: VNPayConfig;
  constructor() {
    this.cf = {
      APP_DOMAIN: config.get<string>('APP_DOMAIN'),
      VNP_HashSecret: config.get<string>('VNP_HashSecret'),
      VNP_ReturnRoute: config.get<string>('VNP_ReturnRoute'),
      VNP_TmnCode: config.get<string>('VNP_TmnCode'),
      VNP_Url: config.get<string>('VNP_Url'),
    };
  }

  generateURLRedirect(txInfo: TransactionInfo, ipAddr: string): string {
    let vnpUrl = this.cf.VNP_Url;

    const date = forceToGMT7DateTime(new Date());
    const createDate = getDateTimeFormat(new Date(date));
    const amount = txInfo.price;

    const orderInfo = txInfo.note;
    const orderType = 'billpayment';
    const locale = 'vn';
    const currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = this.cf.VNP_TmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = txInfo.uuid;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params[
      'vnp_ReturnUrl'
    ] = `${this.cf.APP_DOMAIN}${this.cf.VNP_ReturnRoute}`;
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
    const amount = Math.floor(+vnp_Params['vnp_Amount'] / 100);

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

    const dto = Object.assign(new OrderStatusDto(), {
      ref_uid: vnp_Params['vnp_TxnRef'],
      status_code: vnp_Params['vnp_ResponseCode'],
      amount,
    } as OrderStatusDto);
    switch (vnp_Params['vnp_ResponseCode']) {
      case '00':
        dto.message = 'Giao dịch thành công';
        dto.success = true;
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
        dto.message =
          'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.';
        break;
      case '10':
        dto.message =
          'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần';
        break;
      case '11':
        dto.message =
          'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.';
        break;
      case '12':
        dto.message =
          'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.';
        break;
      case '13':
        dto.message =
          'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.';
        break;
      case '24':
        dto.message = 'Giao dịch không thành công do: Khách hàng hủy giao dịch';
        break;
      case '51':
        dto.message =
          'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.';
        break;
      case '65':
        dto.message =
          'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.';
        break;
      case '75':
        dto.message = 'Ngân hàng thanh toán đang bảo trì.';
        break;
      case '79':
        dto.message =
          'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch';
        break;
      case '99':
        dto.message =
          'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)';
        dto.success = true;
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

export function forceToGMT7DateTime(localTime: Date): number {
  const offsetZone = localTime.getTimezoneOffset() / 60;
  let bonus = 0;
  if (offsetZone !== -7) {
    bonus = 1000 * 60 * 60 * (offsetZone + 7);
  }
  localTime = new Date(localTime.getTime() + bonus);
  return Date.UTC(
    localTime.getFullYear(),
    localTime.getMonth(),
    localTime.getDate(),
    localTime.getHours(),
    localTime.getMinutes(),
    localTime.getSeconds(),
  );
}
