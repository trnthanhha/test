import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
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
import { FindManyOptions, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ListLocationDto } from './dto/list-location-dto';
import { ValidateDistanceDto } from './dto/validate-distance-dto';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  private readonly logger = new Logger(LocationsController.name);
  constructor(
    private readonly locationsService: LocationsService,
    private readonly locationHandleService: LocationHandleService,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
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
    if (!nLimit || nLimit > 200) {
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
    const newLocation = new Location();
    Object.assign(newLocation, createLocationDto);
    const validDistance = await this.locationsService.isValidDistance(
      newLocation,
    );
    newLocation.calculateBounds();

    //biz
    newLocation.nft_status = LocationNFTStatus.PENDING;
    newLocation.type = LocationType.CUSTOMER;
    newLocation.block_radius = DefaultSafeZoneRadius;
    newLocation.country = 'VN';
    if (validDistance) {
      newLocation.status = LocationStatus.APPROVED;
      newLocation.approved_by_id = -1; // System
      newLocation.approved_at = new Date();
    } else {
      newLocation.status = LocationStatus.PENDING;
    }
    //sys
    newLocation.user_id = user.id;
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
        return this.locationsService.create(newLocation, dbManager);
      },
    );
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
}
