import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../../decorators/roles.decorator';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { getObjectExcludedFields } from '../../utils/response_wrapper';
import { GetAuthUser } from '../../decorators/user.decorator';
import { User } from './entities/user.entity';
import { UserType } from './users.constants';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth()
  @Get(':id')
  async getProfile(@Param('id') id: string, @GetAuthUser() user: User) {
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
