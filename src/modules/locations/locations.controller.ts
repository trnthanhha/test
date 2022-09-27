import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { GetAuthUser } from '../../decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { LocationsService } from './locations.service';
import {
  DefaultSafeZoneRadius,
  LocationNFTStatus,
  LocationStatus,
  LocationType,
} from './locations.contants';
import { Location } from './entities/location.entity';
import { UserType } from '../users/users.constants';
import { Auth } from '../../decorators/roles.decorator';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationHandleService } from '../location-handle/location-handle.service';
import { FindManyOptions, Like, Raw, Repository } from 'typeorm';
import { ListLocationDto } from './dto/list-location-dto';
import { ValidateDistanceDto } from './dto/validate-distance-dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UsersService } from '../users/users.service';
import { MigrateLocationDto } from './dto/migrate-location-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  private readonly logger = new Logger(LocationsController.name);
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    private readonly locationsService: LocationsService,
    private readonly locationHandleService: LocationHandleService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({
    summary: 'Get all locations by page',
  })
  @ApiImplicitQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Page number, from 1 to n',
  })
  @ApiImplicitQuery({
    name: 'limit',
    required: false,
    type: String,
    description: 'Page size | Limit per page',
  })
  @ApiImplicitQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Location name',
  })
  @ApiImplicitQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Includes: approved, rejected, pending',
  })
  @ApiImplicitQuery({
    name: 'blacklist',
    required: false,
    type: Boolean,
    description: 'Filter locations which are in blacklist',
  })
  @ApiImplicitQuery({
    name: 'owned',
    required: false,
    type: Boolean,
    description: 'Filter locations which are being owned by someone',
  })
  findAll(
    @GetAuthUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
    @Query('status') status?: string,
    @Query('blacklist') blacklist?: boolean,
    @Query('owned') owned?: boolean,
  ): Promise<ListLocationDto> {
    let nLimit = +limit;
    if (!nLimit || nLimit > 500) {
      nLimit = 50;
    }

    let nPage = +page;
    if (!nPage || nPage <= 0) {
      nPage = 1;
    }

    const { where: whereCondition }: FindManyOptions<Location> = { where: {} };
    if (status && user) {
      whereCondition.status = status as LocationStatus;
      if (user.type === UserType.CUSTOMER) {
        whereCondition.user_id = user.id;
      }
    }

    if (!whereCondition.status) {
      whereCondition.status = LocationStatus.APPROVED;
    }

    whereCondition.purchase_status = Raw(
      `purchase_status IS NULL OR type = 'admin'`, // not pending purchase custom location, or admin created location
    );

    if (blacklist && user?.type === UserType.ADMIN) {
      whereCondition.is_blacklist = true;
    }

    if (name) {
      const handle = this.locationHandleService
        .convertViToEn(name)
        .replace(new RegExp(' ', 'g'), '-');
      whereCondition.handle = Like(`%${handle}%`);
    }

    return this.locationsService.findAll(nPage, nLimit, whereCondition, owned);
  }

  @Auth()
  @ApiOperation({
    summary: 'Overall location info',
  })
  @Get('/overall')
  overall() {
    return this.locationsService.getOverallLocationInfo();
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id') id: string, @GetAuthUser() user: User) {
    const item = await this.locationsService.findOne(+id);
    if (user?.type === UserType.ADMIN) {
      return item;
    }

    if (item.is_blacklist) {
      throw new NotFoundException();
    }

    if (item.status !== LocationStatus.APPROVED && item.user_id !== user?.id) {
      // if item pending or rejected, only requests' owner can see the location
      throw new NotFoundException();
    }

    return item;
  }

  @Auth()
  @ApiOperation({
    summary: 'Create a custom location',
  })
  @Post()
  async create(
    @Body() createLocationDto: CreateLocationDto,
    @GetAuthUser() user: User,
  ): Promise<Location> {
    const userDetail = await this.usersService.findByID(user.id);

    return this.locationsService.create(createLocationDto, userDetail);
  }

  @ApiOperation({
    summary: 'Validate distance of custom location',
  })
  @Post('/validate')
  async validateDistance(
    @Body() validateDistanceDto: ValidateDistanceDto,
  ): Promise<boolean> {
    const newLocation = new Location();
    Object.assign(newLocation, validateDistanceDto);
    return this.locationsService.isValidDistance(newLocation);
  }

  @Auth(UserType.ADMIN)
  @ApiOperation({
    summary: 'Update a custom location',
  })
  @Put()
  async update(@Body() updateLocationDto: UpdateLocationDto) {
    const criteria: { id?: number; handle?: string } = {};
    if (!!updateLocationDto.id && updateLocationDto.id > 0) {
      criteria.id = updateLocationDto.id;
    } else if (updateLocationDto.handle) {
      criteria.handle = updateLocationDto.handle;
    } else {
      throw new BadRequestException(
        'no criteria found, all your locations will be update with same value, be careful',
      );
    }
    const existed = await this.locationRepository.findOneBy({ ...criteria });
    if (!existed) {
      throw new NotFoundException();
    }

    const value: QueryDeepPartialEntity<Location> = {};
    if (updateLocationDto.lat) {
      value.lat = updateLocationDto.lat;
      existed.lat = value.lat;
    }
    if (updateLocationDto.long) {
      value.long = updateLocationDto.long;
      existed.long = value.long;
    }
    if (updateLocationDto.nft_image) {
      value.map_captured = updateLocationDto.nft_image;
    }
    if (updateLocationDto.nft_owner) {
      value.user_full_name = updateLocationDto.nft_owner;
    }
    if (updateLocationDto.nft_network_token_id) {
      value.token_id = updateLocationDto.nft_network_token_id;
    }

    existed.calculateBounds();
    value.safe_zone_right = existed.safe_zone_right;
    value.safe_zone_left = existed.safe_zone_left;
    value.safe_zone_top = existed.safe_zone_top;
    value.safe_zone_bot = existed.safe_zone_bot;

    const rs = await this.locationRepository.update(criteria, value);
    return {
      success: rs.affected > 0,
    };
  }

  @Auth(UserType.ADMIN)
  @ApiOperation({
    summary: 'Migrate new locations data',
  })
  @Post('/migrate')
  @UseInterceptors(ClassSerializerInterceptor)
  async migrate(
    @Body() migrateLocationDto: MigrateLocationDto,
    @GetAuthUser() user: User,
  ): Promise<Location> {
    const newLocation = new Location();
    // validate
    const dateNMonth = migrateLocationDto.purchase_date.split('/');
    if (!dateNMonth || dateNMonth.length !== 2) {
      throw new BadRequestException('purchase date is wrong format');
    }
    const paidAt = new Date(
      new Date().setMonth(+dateNMonth[1] - 1, +dateNMonth[0]),
    );

    // transfer
    newLocation.name = migrateLocationDto.nft_name;
    newLocation.lat = migrateLocationDto.lat;
    newLocation.long = migrateLocationDto.long;
    newLocation.user_full_name = migrateLocationDto.nft_owner;
    newLocation.token_id = migrateLocationDto.nft_network_token_id;

    // biz
    newLocation.block_radius = DefaultSafeZoneRadius;
    newLocation.calculateBounds();

    newLocation.nft_status = LocationNFTStatus.APPROVED;
    newLocation.type = LocationType.ADMIN;
    newLocation.country = 'VN';
    newLocation.status = LocationStatus.APPROVED;
    newLocation.approved_by_id = user.id; // System
    newLocation.approved_at = paidAt;
    newLocation.paid_at = paidAt;
    // sys
    newLocation.created_by_id = user.id;

    const dbManager = this.locationRepository.manager;
    return await dbManager.transaction(
      async (entityManager): Promise<Location> => {
        newLocation.handle = await this.locationHandleService
          .createHandle(newLocation.name, entityManager)
          .catch((ex) => {
            this.logger.error('exception create handle', ex.message);
            throw ex;
          });
        return dbManager.getRepository(Location).save(newLocation);
      },
    );
  }

  @Auth()
  @ApiOperation({
    summary: 'Delete a location',
  })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.locationsService.delete(+id);
  }
}
