import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ListOrderDto } from './dto/list-order.dto';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { User } from '../users/entities/user.entity';
import { Auth } from '../../decorators/roles.decorator';
import { UserType } from '../users/users.constants';
import { GetAuthUser } from '../../decorators/user.decorator';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Auth()
  @ApiOperation({
    summary: 'Create a order'
  })
  @ApiOkResponse({
    type: CreateOrderDto,
    status: 201,
  })
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @GetAuthUser() currentUser: User) {
    return this.ordersService.create(createOrderDto, currentUser);
  }

  @Auth()
  @Get()
  @ApiOperation({
    summary: 'Find all orders'
  })
  @ApiOkResponse({
    type: ListOrderDto,
    status: 200,
    isArray: false,
  })
  @ApiNotFoundResponse()
  @ApiImplicitQuery({
    name: 'page',
    description: 'The page want to query',
    example: 5,
    required: false,
  })
  @ApiImplicitQuery({
    name: 'limit',
    description: 'The limit of records in page',
    example: 10,
    required: false,
  })
  @ApiImplicitQuery({
    name: 'payment_status',
    description: 'The status of order',
    example: 'PENDING',
    required: false,
  })
  findAll(
    @Query('page') page?: string, 
    @Query('limit') limit?: string, 
    @Query('payment_status') payment_status?: string
  ) {
    return this.ordersService.findAll({ limit, page, payment_status });
  }

  @Auth()
  @ApiOperation({
    summary: 'Find order by Id',
  })
  @ApiParam({
    name: 'id',
    description: 'The id of order',
    example: 1,
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Auth(UserType.ADMIN)
  @ApiOperation({ summary: 'Update a order' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Auth(UserType.ADMIN)
  @ApiOperation({ summary: 'Delete a order' })
  @ApiOkResponse({
    status: 200,
    description: 'Delete success'
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
