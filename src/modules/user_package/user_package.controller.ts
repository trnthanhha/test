import { Controller, Get } from '@nestjs/common';
import { UserPackageService } from './user_package.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('combo/package')
@Controller('user-package')
export class UserPackageController {
  constructor(private readonly userPackageService: UserPackageService) {}
  @Get()
  @ApiOperation({
    summary:
      'Toàn bộ package/combo user đang sở hữu có thể sử dụng để mua địa điểm (đã thanh toán, remaining_quantity > 0)',
  })
  findAll() {
    return this.userPackageService.findUsablePackages();
  }
}
