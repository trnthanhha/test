import {
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UserPackageService } from './user_package.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { GetAuthUser } from '../../decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { FindOptionsWhere, ILike } from 'typeorm';
import { UserType } from '../users/users.constants';
import { Auth } from '../../decorators/roles.decorator';
import { UserPackage } from './entities/user_package.entity';
import { PaginationResult } from '../../utils/pagination';
import { RemainNftResponse } from './dto/remain-nft-response.dto';

@ApiTags('combo/package')
@Controller('user-package')
export class UserPackageController {
  constructor(private readonly userPackageService: UserPackageService) {}
  @Get('/choices')
  @Auth()
  @ApiOperation({
    summary: 'Danh sách quyền chọn mua NFT địa điểm',
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
  async getChoices(
    @GetAuthUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginationResult<UserPackage>> {
    let nLimit = +limit;
    if (!nLimit || nLimit > 500) {
      nLimit = 50;
    }

    let nPage = +page;
    if (!nPage || nPage <= 0) {
      nPage = 1;
    }

    return this.userPackageService.findUsableChoices(nLimit, nPage, user);
  }

  @Get()
  @Auth()
  @ApiOperation({
    summary:
      'Toàn bộ package/combo user đang sở hữu có thể sử dụng để mua địa điểm (đã thanh toán, remaining_quantity > 0)',
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
  @ApiImplicitQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Combo name',
  })
  @ApiImplicitQuery({
    name: 'status',
    required: false,
    type: String,
    description:
      'all | paid | failed | unauthorized | cancelled. Default = paid',
  })
  @ApiImplicitQuery({
    name: 'user_id',
    required: true,
    type: Number,
    description: 'Filter user package by owner',
  })
  async findAll(
    @GetAuthUser() user: User,
    @Query('user_id') user_id: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
    @Query('status') status?: string,
  ): Promise<PaginationResult<UserPackage>> {
    let nLimit = +limit;
    if (!nLimit || nLimit > 500) {
      nLimit = 50;
    }

    let nPage = +page;
    if (!nPage || nPage <= 0) {
      nPage = 1;
    }

    const where: FindOptionsWhere<UserPackage> = {};
    if (user.type === UserType.CUSTOMER) {
      if (user_id && user.id !== user_id) {
        throw new ForbiddenException("user not allow to check others' combo");
      }
      where.user_id = user.id;
    }

    if (name) {
      where.package_name = ILike(`%${name}%`);
    }
    const pagi = await this.userPackageService.findUsablePackages(
      where,
      nLimit,
      nPage,
      status,
    );
    pagi.data.forEach((item) => {
      if (item.owner instanceof User) {
        item.owner_id = item.owner?.id;
        item.owner = item.owner.full_name;
      }

      if (item.buyer instanceof User) {
        item.buyer_id = item.buyer?.id;
        item.buyer = item.buyer.full_name;
      }
    });

    return pagi;
  }

  @Auth()
  @Get('/remaining-nft')
  @ApiOperation({ summary: 'Lấy các điểm nft chưa được chọn của user' })
  @ApiOkResponse({ type: RemainNftResponse })
  getRemainingNft(@GetAuthUser() user: User) {
    return this.userPackageService.getRemainingNft(user);
  }
}
