import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, InsertResult, Repository } from 'typeorm';
import { LocationHandle } from './entities/location-handle.entity';

@Injectable()
export class LocationHandleService {
  constructor(
    @InjectRepository(LocationHandle)
    private locationHandleRepo: Repository<LocationHandle>,
  ) {}

  createHandle(name: string, dbManager?: EntityManager): Promise<InsertResult> {
    if (!dbManager) {
      dbManager = this.locationHandleRepo.manager;
    }
    const handle = new LocationHandle();
    handle.name = this.convertViToEn(name);
    handle.name = handle.name.replace(new RegExp(' ', 'g'), '-');
    return dbManager
      .createQueryBuilder()
      .insert()
      .into(LocationHandle)
      .values(handle)
      .orUpdate(['total'], ['name'])
      .execute();
  }

  //@Author: https://gist.github.com/hu2di/e80d99051529dbaa7252922baafd40e3?permalink_comment_id=3431660#gistcomment-3431660
  convertViToEn(str, toUpperCase = false) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư

    return toUpperCase ? str.toUpperCase() : str;
  }
}
