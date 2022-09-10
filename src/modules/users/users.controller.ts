import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../decorators/roles.decorator';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { getObjectExcludedFields } from '../../utils/response_wrapper';
import { GetAuthUser } from '../../decorators/user.decorator';
import { User } from './entities/user.entity';
import { LimitSearchProfilePerMin, UserType } from './users.constants';
import Redis from 'ioredis';
import { REDIS_CLIENT_PROVIDER } from '../redis/redis.constants';
import { generateRedisKey } from '../redis/redis.keys.pattern';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(REDIS_CLIENT_PROVIDER) private readonly redis: Redis,
  ) {}

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

    return getObjectExcludedFields(customer, [
      'identification_number',
      'identification_created_at',
    ]);
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
