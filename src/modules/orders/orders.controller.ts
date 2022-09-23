import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ListOrderDto } from './dto/list-order.dto';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { Auth } from '../../decorators/roles.decorator';
import { UserType } from '../users/users.constants';
import { PaymentGatewayFactory } from './vendor_adapters/payment.vendor.adapters';
import { OrderStatusDto } from './dto/order-status-dto';
import { CheckoutDto } from './dto/checkout-dto';
import { GetAuthUser } from '../../decorators/user.decorator';
import { UsersService } from '../users/users.service';
import { BillsService } from '../bills/bills.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly billsService: BillsService,
    private readonly usersService: UsersService,
  ) {}

  @Auth()
  @ApiOperation({
    summary: 'Create a order',
  })
  @ApiOkResponse({
    type: CreateOrderDto,
    status: 201,
  })
  @Post('/checkout')
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req,
    @GetAuthUser() authUser,
  ): Promise<CheckoutDto> {
    const user = await this.usersService.findByID(authUser.id);

    return this.ordersService.checkout(createOrderDto, req, user);
  }

  @Auth()
  @Get()
  @ApiOperation({
    summary: 'Find all orders',
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
    example: 'unauthorized',
    required: false,
  })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('payment_status') payment_status?: string,
  ) {
    return this.ordersService.findAll({ limit, page, payment_status });
  }

  @Auth()
  @Get('/status')
  async validateStatus(@Req() req): Promise<OrderStatusDto> {
    const response = PaymentGatewayFactory.Build().decodeResponse(req);

    const bill = await this.billsService.findOneByRefID(response.ref_uid);
    const order = await this.ordersService.findOne(bill.order_id);
    return Object.assign(response, order);
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
  @ApiOperation({ summary: 'Delete a order' })
  @ApiOkResponse({
    status: 200,
    description: 'Delete success',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
