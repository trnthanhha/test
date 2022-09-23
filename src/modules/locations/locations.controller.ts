import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { GetAuthUser } from '../../decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { LocationsService } from './locations.service';
import { LocationStatus } from './locations.contants';
import { Location } from './entities/location.entity';
import { UserType } from '../users/users.constants';
import { Auth } from '../../decorators/roles.decorator';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationHandleService } from '../location-handle/location-handle.service';
import { FindManyOptions, Like, Raw } from 'typeorm';
import { ListLocationDto } from './dto/list-location-dto';
import { ValidateDistanceDto } from './dto/validate-distance-dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UsersService } from '../users/users.service';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  private readonly logger = new Logger(LocationsController.name);
  constructor(
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
  @Auth()
  @ApiOperation({
    summary: 'Update a location',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateLocationDto) {
    return this.locationsService.update(+id, updateOrderDto);
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
