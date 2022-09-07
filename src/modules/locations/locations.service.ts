import { Injectable, Logger } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import {
  LocationNFTStatus,
  LocationStatus,
  LocationType,
} from './locations.contants';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  create(createLocationDto: CreateLocationDto) {
    return 'This action adds a new location';
  }

  findAll(page: number, limit: number) {
    return this.locationRepository.find({
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} location`;
  }

  async existAny(): Promise<boolean> {
    return !!(await this.locationRepository.findOneBy({}));
  }

  async createMany(req: Array<Location>): Promise<Array<Location>> {
    return new Promise((resolve) => {
      let inserted = [] as Array<Location>;
      this.locationRepository.manager.transaction(async (entityManager) => {
        const batchSize = 3;
        let start = 0;
        while (start < req.length) {
          let inserts = req.slice(start, start + batchSize);
          if (!inserts.length) {
            break;
          }
          inserts = inserts.map((item) => {
            const instance = new Location();
            Object.assign(instance, item);
            instance.country = 'VN';
            instance.type = LocationType.ADMIN;
            instance.approved_at = new Date();
            instance.approved_by_id = -1;
            instance.created_by_id = -1;
            instance.block_radius = 100;
            instance.status = LocationStatus.APPROVED;
            instance.nft_status = instance.token_id
              ? LocationNFTStatus.MINTED
              : LocationNFTStatus.PENDING;

            return instance;
          });
          await entityManager.save(inserts);
          inserted = inserted.concat(inserts);
          start += batchSize;
        }

        resolve(inserted);
      });
    });
  }

  transformRawData(row: Array<string>): Location {
    //1
    const dateNMonth = row[1].split('/');
    const paid_at = new Date(
      new Date().setMonth(+dateNMonth[1] - 1, +dateNMonth[0]),
    );
    return {
      paid_at,
      name: row[2],
      lat: +row[5],
      long: +row[6],
      map_captured: row[8],
      token_id: +row[9],
      province: row[10],
      district: row[11],
      commune: row[12],
      street: row[13],
    } as Location;
  }
}
