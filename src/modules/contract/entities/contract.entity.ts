import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Contract {
  @ApiProperty({
    name: 'id',
    description: 'the id of contract',
    example: 1,
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    name: 'location_id',
    example: 1,
    type: Number,
  })
  @Column({ name: 'location_id' })
  location_id: number;

  @ApiProperty({
    name: 'buyer_id',
    example: 1,
    type: Number,
  })
  @Column({ name: 'buyer_id' })
  buyer_id: number;

  @ApiProperty({
    name: 'owner_id',
    example: 1,
    type: Number,
  })
  @Column({ name: 'owner_id' })
  owner_id: number;
}
