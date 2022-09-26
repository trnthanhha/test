import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../decorators/roles.decorator';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { getObjectExcludedFields } from '../../utils/response_wrapper';
import { GetAuthUser } from '../../decorators/user.decorator';
import { User } from './entities/user.entity';
import { LimitSearchProfilePerMin, UserType } from './users.constants';
import Redis from 'ioredis';
import { REDIS_CLIENT_PROVIDER } from '../redis/redis.constants';
import { generateRedisKey } from '../redis/redis.keys.pattern';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpService } from '@nestjs/axios';
import { LocamosLinkageService } from '../../services/locamos-linkage/user.service';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly httpService: HttpService,
    @Inject(REDIS_CLIENT_PROVIDER) private readonly redis: Redis,
  ) {}

  @Get('')
  @ApiOperation({
    summary: 'List User',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiImplicitQuery({
    name: 'page',
    required: true,
    type: String,
    description: 'Page number, from 1 to n',
  })
  @ApiImplicitQuery({
    name: 'limit',
    required: true,
    type: String,
    description: 'Page size | Limit per page',
  })
  @ApiImplicitQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Type of user',
    example: `examples: ${UserType.ADMIN}, ${UserType.CUSTOMER}`,
  })
  @ApiImplicitQuery({
    name: 'search',
    required: false,
    description: 'search by username(phone or email, name)',
  })
  listUser(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('type') type: UserType,
    @Query('search') search: string,
  ) {
    return this.usersService.listUser(+page, +limit, type, search);
  }

  @Get('/customers')
  @ApiOperation({
    summary: 'Searching customer with username to buy for',
  })
  @UseInterceptors(ClassSerializerInterceptor)
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
  searchCustomers(
    @Query('username') username: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.searchCustomers(username, +page, +limit);
  }

  @Auth()
  @Get(':id')
  async getProfile(@Param('id') id: string, @GetAuthUser() user: User) {
    await checkRateLimit(this.redis, user);

    const customer = await this.usersService.findByID(+id);
    if (!customer) {
      return;
    }

    if (user.type === UserType.CUSTOMER) {
      // block data if;
      switch (true) {
        case customer.type === UserType.ADMIN:
          throw new NotFoundException();
      }
    }

    const filtered = getObjectExcludedFields(customer, [
      'identification_number',
      'identification_created_at',
    ]);

    const profile = await new LocamosLinkageService(
      this.httpService,
    ).getProfile(customer.locamos_access_token);

    return Object.assign(filtered, profile);
  }

  @ApiOperation({ summary: 'create a user' })
  @Post()
  create(@Body() data: CreateUserDto) {
    return this.usersService.createUser(data);
  }

  @ApiOperation({ summary: 'update a user' })
  @Patch(':id')
  @ApiOkResponse({
    type: UpdateUserDto,
  })
  update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.usersService.updateUser(+id, data);
  }

  @ApiOperation({ summary: 'delete a user' })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.deleteUser(+id);
  }
}

async function checkRateLimit(redis: Redis, user: User) {
  if (!user?.id) {
    throw new UnauthorizedException();
  }

  const limitKey = generateRedisKey(UsersService.name, 'getProfile', user.id);
  const newValue = await redis.incr(limitKey);
  if (newValue === 1) {
    redis.expire(limitKey, 60);
  } else if (newValue > LimitSearchProfilePerMin) {
    throw new Error('Too many requests');
  }

  return;
}
