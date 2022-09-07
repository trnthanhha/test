import User from '@modules/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as admin from 'firebase-admin';
import { DeleteResult, Repository } from 'typeorm';
import Device from './entities/device.entity';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  verifyFcmToken(fcmToken: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      return admin
        .messaging()
        .send(
          {
            token: fcmToken,
          },
          true,
        )
        .then(() => resolve(true))
        .catch((error: Error) => {
          console.log('🚀 ~ error', error, fcmToken);
          resolve(false);
        });
    });
  }

  async create(fcmToken: string, user: User): Promise<Device> {
    return await this.verifyFcmToken(fcmToken).then(async (valid: boolean) => {
      if (valid) {
        const device: Device = await this.deviceRepository.findOne({
          fcmToken,
          user: { id: user.id },
        });

        if (!device) {
          const nDevice: Device = new Device();
          nDevice.fcmToken = fcmToken;
          nDevice.user = user;

          return await this.deviceRepository.save(nDevice);
        }

        return device;
      }
    });
  }

  async findAll(): Promise<Device[]> {
    return await this.deviceRepository.find({ relations: ['user'] });
  }

  async findFcmByUser(userId: number): Promise<string[]> {
    const devices: Device[] = await this.deviceRepository.find({
      user: { id: userId },
    });

    return devices.map((device: Device) => device.fcmToken);
  }

  async remove(fcmToken: string, user: User): Promise<DeleteResult> {
    const device: Device = await this.deviceRepository.findOne({
      fcmToken,
      user: { id: user.id },
    });

    if (device) {
      return await this.deviceRepository.delete(device.id);
    }
  }
}
