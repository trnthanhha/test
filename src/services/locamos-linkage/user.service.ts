import { LocaMosEndpoint } from '../../modules/auth/auth.constants';
import { lastValueFrom, map } from 'rxjs';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

export class LocamosLinkageService {
  constructor(private readonly httpService: HttpService) {}

  async getProfile(accessToken: string): Promise<any> {
    const obs = this.httpService
      .get(`${process.env.LOCAMOS_BASE_URL}${LocaMosEndpoint.Profile}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
          client_id: process.env.LOCAMOS_CLIENT_ID,
          client_secret: process.env.LOCAMOS_CLIENT_SECRET,
        },
      })
      .pipe(map((res) => res.data));

    try {
      const response = await lastValueFrom(obs);
      if (!response?.data.info || !response?.data.wallet) {
        throw new InternalServerErrorException('Invalida data');
      }
      return response.data;
    } catch (ex) {
      if (ex?.message === 'Request failed with status code 401') {
        throw new UnauthorizedException('Unauthorized. Please re-login');
      }
      throw ex;
    }
  }
}
