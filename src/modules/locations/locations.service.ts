import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindManyOptions,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Location } from './entities/location.entity';
import {
  DefaultSafeZoneRadius,
  LocationNFTStatus,
  LocationPurchaseStatus,
  LocationStatus,
  LocationType,
  MinimumDistanceConflict,
} from './locations.contants';
import { getDistanceBetween, MeterPerDegree } from './locations.calculator';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationHandleService } from '../location-handle/location-handle.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { User } from '../users/entities/user.entity';
import { PaginationResult } from '../../utils/pagination';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    private readonly locationHandleService: LocationHandleService,
  ) {}

  async create(
    createLocationDto: CreateLocationDto,
    user: User,
    owner_id?: number,
    dbManager?: EntityManager,
  ): Promise<Location> {
    const newLocation = new Location();
    Object.assign(newLocation, createLocationDto);
    const validDistance = await this.isValidDistance(newLocation);
    newLocation.block_radius = DefaultSafeZoneRadius;
    newLocation.calculateBounds();

    //biz
    newLocation.nft_status = LocationNFTStatus.PENDING;
    newLocation.type = LocationType.CUSTOMER;
    newLocation.country = 'VN';
    if (validDistance) {
      newLocation.status = LocationStatus.APPROVED;
      newLocation.approved_by_id = -1; // System
      newLocation.approved_at = createLocationDto.requestedAt || new Date();
    } else {
      newLocation.status = LocationStatus.PENDING;
    }
    //sys
    newLocation.user_id = owner_id || user.id;
    newLocation.created_by_id = user.id;
    newLocation.user_full_name = user.full_name;

    dbManager = dbManager || this.locationRepository.manager;
    return dbManager.transaction(async (txManager): Promise<Location> => {
      newLocation.handle = await this.locationHandleService
        .createHandle(newLocation.name, txManager)
        .catch((ex) => {
          this.logger.error('exception create handle', ex.message);
          throw ex;
        });
      return txManager.save(newLocation);
    });
  }

  async findAll(
    page: number,
    limit: number,
    where: FindOptionsWhere<Location>,
    owned = false,
  ): Promise<PaginationResult<Location>> {
    const options = {
      where,
      skip: (page - 1) * limit,
      take: limit,
    } as FindManyOptions<Location>;
    if (owned) {
      options.where = Object.assign(options.where, {
        user_id: MoreThan(0),
      });
    }

    const [data, total] = await this.locationRepository.findAndCount(options);
    return new PaginationResult<Location>(data, total, limit);
  }

  async findOne(id: number, entityManager?: EntityManager) {
    const repo =
      entityManager?.getRepository(Location) || this.locationRepository;
    return repo.findOneBy({ id });
  }

  async checkout(
    dbManager: EntityManager,
    id: number,
    version: number,
  ): Promise<UpdateResult> {
    const updateResult = await dbManager.update(
      Location,
      {
        id,
        version,
      },
      {
        purchase_status: LocationPurchaseStatus.UNAUTHORIZED,
        version: version + 1,
      },
    );
    if (!updateResult.affected) {
      throw new InternalServerErrorException(
        `Invalid version. Location has data changed, id: ${id}`,
      );
    }
    return updateResult;
  }

  async existAny(): Promise<boolean> {
    return !!(await this.locationRepository.findOneBy({}));
  }

  async createMany(req: Array<Location>): Promise<Array<Location>> {
    if (!req.length) {
      this.logger.log('no record to insert');
      return;
    }

    return new Promise((resolve) => {
      let inserted = [] as Array<Location>;
      this.locationRepository.manager.transaction(async (entityManager) => {
        const batchSize = 5;
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
            instance.status = LocationStatus.APPROVED;
            instance.nft_status = instance.token_id
              ? LocationNFTStatus.MINTED
              : LocationNFTStatus.PENDING;

            instance.block_radius = DefaultSafeZoneRadius;
            instance.calculateBounds();
            return instance;
          });
          this.logger.log('before insert records, total: ', inserts.length);
          await entityManager.save(inserts).catch((ex) => {
            console.error(ex);
            console.log(inserts);
            throw ex;
          });
          this.logger.log('after insert records, total: ', inserts.length);
          inserted = inserted.concat(inserts);
          start += batchSize;
        }

        this.logger.log('end while loop, total: ', inserted.length);
        resolve(inserted);
      });
    });
  }

  async isValidDistance(location: Location): Promise<boolean> {
    const delta =
      (DefaultSafeZoneRadius + MinimumDistanceConflict) / MeterPerDegree;

    const nearLocations = await this.locationRepository.findBy({
      status: LocationStatus.APPROVED,
      safe_zone_bot: LessThanOrEqual(location.lat + delta),
      safe_zone_top: MoreThanOrEqual(location.lat - delta),
      safe_zone_left: LessThanOrEqual(location.long + delta),
      safe_zone_right: MoreThanOrEqual(location.long - delta),
    });

    if (!nearLocations.length) {
      return true;
    }

    return !nearLocations.find(
      (loc) =>
        getDistanceBetween(loc, location) <
        DefaultSafeZoneRadius + MinimumDistanceConflict + loc.block_radius,
    );
  }

  transformRawData(row: Array<string>): Location {
    //1
    const dateNMonth = row[1].split('/');
    const paid_at = new Date(
      new Date().setMonth(+dateNMonth[1] - 1, +dateNMonth[0]),
    );
    const loc = new Location();
    return Object.assign(loc, {
      paid_at,
      name: row[2].replace(new RegExp('"', 'g'), ''),
      lat: +row[5],
      long: +row[6],
      user_full_name: row[7],
      map_captured: row[8],
      token_id: +row[9],
      province: row[10],
      district: row[11],
      commune: row[12],
      street: row[13],
    });
  }

  async update(id: number, updateOrderDto: UpdateLocationDto) {
    const location = await this.locationRepository.findOne({
      where: { id: id },
    });

    if (!location) throw new Error('Location does not exist');
    Object.keys(updateOrderDto).forEach(
      (value) => (location[value] = updateOrderDto[value]),
    );

    const updateLocation = await this.locationRepository.save(location);
    return updateLocation;
  }

  async delete(id: number) {
    return this.locationRepository.delete(id);
  }

  async getOverallLocationInfo() {
    const [
      totalBlackListLocations,
      totalOwnedLocations,
      totalApproveLocations,
      totalCustomLocations,
    ] = await Promise.all([
      this.locationRepository.count({ where: { is_blacklist: true } }),
      this.locationRepository.count({ where: { user_id: MoreThan(0) } }),
      this.locationRepository.count({
        where: { status: LocationStatus.APPROVED },
      }),
      this.locationRepository.count({ where: { type: LocationType.CUSTOMER } }),
    ]);

    return {
      owned_locations: totalOwnedLocations,
      approve_locations: totalApproveLocations,
      custom_locations: totalCustomLocations,
      backlist_locations: totalBlackListLocations,
    };
  }
}
