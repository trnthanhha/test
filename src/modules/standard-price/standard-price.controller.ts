import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { Auth } from 'src/decorators/roles.decorator';
import { GetAuthUser } from 'src/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { UpdateStandardPriceDto } from './dto/update-standard-price.dto';
import { StandardPriceService } from './standard-price.service';

@ApiTags('standard-price')
@Controller('standard-price')
export class StandardPriceController {
  constructor(private readonly standPriceSerivce: StandardPriceService) {}

  @ApiOperation({
    summary: 'get standard price',
  })
  @Get()
  async get() {
    return this.standPriceSerivce.getStandardPrice();
  }

  @ApiOperation({
    summary: 'update price location',
  })
  @ApiOkResponse({
    status: 200,
  })
  @Auth()
  @Patch()
  async update(
    @Body() data: UpdateStandardPriceDto,
    @GetAuthUser() user: User,
  ) {
    return this.standPriceSerivce.updateStandPrice(+data.price, user);
  }

  @ApiOperation({
    summary: 'get price standard history',
  })
  @ApiImplicitQuery({
    name: 'page',
    example: 1,
  })
  @ApiImplicitQuery({
    name: 'limit',
    example: 10,
  })
  @Auth()
  @Get('/history')
  async getStandardPriceHistorys(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.standPriceSerivce.getStandardPriceHistory({ page, limit });
  }
}
