import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
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
import { GetAuthUser } from '../../decorators/user.decorator';
import { UsersService } from '../users/users.service';
import { BillsService } from '../bills/bills.service';
import { REDIS_CLIENT_PROVIDER } from '../redis/redis.constants';
import Redis from 'ioredis';
import { PaymentType } from './orders.constants';
import { generateRedisKey } from '../redis/redis.keys.pattern';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly billsService: BillsService,
    private readonly usersService: UsersService,
    @Inject(REDIS_CLIENT_PROVIDER) private readonly redis: Redis,
  ) {}
  private prefixRedisKey = `${OrdersService.name}-checkout`;

  @Auth()
  @ApiOperation({
    summary:
      '1. Mua location đã tồn tại -> location_id là bắt buộc\n' +
      '2. Mua location chưa tồn tại -> lat/long/name/map_captured là bắt buộc\n' +
      '3. Mua location bằng package/combo -> user_package_id là bắt buộc\n' +
      '4. Mua package bằng cash/point -> package_id là bắt buộc\n',
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
  ) {
    const user = await this.usersService.findByID(authUser.id);
    if (
      createOrderDto.type === PaymentType.POINT &&
      (await this.isOtherOrderOnProcess(user.id))
    ) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: 'Other order is on processing',
        },
        429,
      );
    }

    return this.ordersService
      .checkout(createOrderDto, req, user)
      .finally(() => {
        if (createOrderDto.type === PaymentType.POINT) {
          this.clearProcessing(user.id);
        }
      });
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
  @ApiImplicitQuery({
    name: 'target',
    description: 'target to buy, includes: location | combo',
    example: 'location | combo',
    required: false,
  })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('payment_status') payment_status?: string,
    @Query('target') target?: string,
  ) {
    return this.ordersService.findAll({ limit, page, payment_status, target });
  }

  @Auth()
  @Get('/status')
  async validateStatus(@Req() req): Promise<OrderStatusDto> {
    const response = PaymentGatewayFactory.Build().decodeResponse(req);
    if (!response.ref_uid) {
      return response;
    }

    const bill = await this.billsService.findOneByRefID(
      response.ref_uid,
      false,
    );
    if (!bill) {
      throw new InternalServerErrorException('not found bill');
    }
    const order = await this.ordersService.findOne(bill.order_id); // get detail order for relations
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

  async isOtherOrderOnProcess(userId: number): Promise<boolean> {
    const orderProcess = generateRedisKey(this.prefixRedisKey, userId);

    const rs = await this.redis.get(orderProcess);
    if (!!rs) {
      return true;
    }

    await this.redis.set(orderProcess, 1, 'EX', 600, 'NX');
    await this.redis.expire(orderProcess, 60, 'NX');
  }

  async clearProcessing(userId: number) {
    await this.redis.del(generateRedisKey(this.prefixRedisKey, userId));
  }
}
