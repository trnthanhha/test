import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
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
import { Order } from './entities/order.entity';
import { OrderStatusDto } from './dto/order-status-dto';
import { randomUUID } from 'crypto';
import { LocationsService } from '../locations/locations.service';
import { StandardPriceService } from '../standard-price/standard-price.service';
import { PaymentStatus } from './orders.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { CheckoutDto } from './dto/checkout-dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly locationsService: LocationsService,
    private readonly standardPriceService: StandardPriceService,
    @InjectRepository(Order)
    private repository: Repository<Order>,
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
  ): Promise<CheckoutDto> {
    const loc = await this.locationsService.findOne(createOrderDto.location_id);
    if (!loc) {
      return CheckoutDto.fail(new NotFoundException(), 'Location not existed');
    }

    if (!loc.canPurchased()) {
      return CheckoutDto.fail(
        new BadRequestException(),
        'Location is unable to purchase',
      );
    }

    const stdPrice = await this.standardPriceService.getStandardPrice();
    if (!stdPrice) {
      return CheckoutDto.fail(
        new InternalServerErrorException(),
        'Cant get price to purchase',
      );
    }

    const pmGateway = PaymentGatewayFactory.Build();
    const order = new Order();
    Object.assign(order, createOrderDto);
    order.ref_uid = randomUUID();
    order.price = stdPrice.price;
    order.payment_status = PaymentStatus.UNAUTHORIZED;

    const rs = await this.repository.manager.transaction(
      async (entityManager): Promise<[UpdateResult, Order]> => {
        return await Promise.all([
          this.locationsService.checkout(loc.id, loc.version, entityManager),
          this.ordersService.create(order),
        ]);
      },
    );
    if (!rs[0].affected || !rs[1].id) {
      return CheckoutDto.fail(
        new InternalServerErrorException(),
        'No rows affected',
      );
    }

    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const redirectUrl = pmGateway.generateURLRedirect(order, ipAddr);
    return CheckoutDto.success(redirectUrl);
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
  validateStatus(@Req() req): OrderStatusDto {
    return PaymentGatewayFactory.Build().decodeResponse(req);
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
    description: 'Delete success',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
