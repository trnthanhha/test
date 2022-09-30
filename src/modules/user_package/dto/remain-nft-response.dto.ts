import { ApiProperty } from '@nestjs/swagger';

export class RemainNftResponse {
  @ApiProperty({ name: 'total_remain_nft', example: 2 })
  total_remain_nft: number;
}
