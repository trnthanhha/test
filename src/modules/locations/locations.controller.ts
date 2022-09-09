import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
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

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

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
    @Query('status') status?: string,
    @Query('blacklist') blacklist?: boolean,
    @Query('owned') owned?: boolean,
  ) {
    let nLimit = +limit;
    if (!nLimit || nLimit > 200) {
      nLimit = 50;
    }

    let nPage = +page;
    if (!nPage || nPage <= 0) {
      nPage = 1;
    }

    const whereCondition = new Location();
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
}
