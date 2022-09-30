import { HttpService } from '@nestjs/axios';
import { LocaMosEndpoint } from '../../modules/auth/auth.constants';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom, map } from 'rxjs';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrepareError, SkipError } from '../../errors/types';

export type PackageTransactionInfo = {
  seq_id: string;
  package_id: string;
  nft_address: string[];
};

export class TransactionLinkageService {
  constructor(private readonly httpService: HttpService) {}

  async notifyBuyPackage(accessToken: string, data: PackageTransactionInfo) {
    const obs = this.httpService
      .post(
        `${process.env.LOCAMOS_BASE_URL}${LocaMosEndpoint.BuyPackage}`,
        data,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
            'X-NIP-3rd-secret': process.env.LOCAMOS_3RD_SECRET,
            client_id: process.env.LOCAMOS_CLIENT_ID,
            client_secret: process.env.LOCAMOS_CLIENT_SECRET,
          },
          data,
        } as AxiosRequestConfig,
      )
      .pipe(map((res) => res.data));

    const response = await lastValueFrom(obs);
    if (!response) {
      throw new BadRequestException();
    }
    if (
      response.message ===
      'Hệ thống đang nâng cấp.Vui lòng thử lại sau ít phút.'
    ) {
      throw new PrepareError(response, response.message);
    }

    if (
      response.code === 400 &&
      response.message === 'Giao dịch này đã được xử lý'
    ) {
      throw new SkipError(null, 'Giao dịch này đã được xử lý');
    }
    if (response.code === 401) {
      throw new UnauthorizedException('Please re-login');
    }
    if (!response?.data || response?.code !== 1) {
      throw new InternalServerErrorException(
        'Undefined error, data response incorrect',
      );
    }
  }
}
