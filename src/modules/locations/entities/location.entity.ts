import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  LocationNFTStatus,
  LocationStatus,
  LocationType,
} from '../locations.contants';
import { Exclude } from 'class-transformer';
import { getBoundsByRadius } from '../locations.calculator';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  handle: string;

  @Column()
  map_captured: string;

  @Column({ type: 'double precision' })
  long: number;

  @Column({ type: 'double precision' })
  lat: number;

  @Index()
  @Column({ type: 'double precision' })
  safe_zone_top: number;

  @Index()
  @Column({ type: 'double precision' })
  safe_zone_bot: number;

  @Index()
  @Column({ type: 'double precision' })
  safe_zone_left: number;

  @Index()
  @Column({ type: 'double precision' })
  safe_zone_right: number;

  @Exclude()
  @Column({ type: 'enum', enum: LocationType })
  type: LocationType;

  @Exclude()
  @Index()
  @Column({ type: 'enum', enum: LocationStatus })
  status: LocationStatus;

  @Exclude()
  @Column({
    type: 'enum',
    enum: LocationNFTStatus,
    default: LocationNFTStatus.PENDING,
  })
  nft_status: LocationNFTStatus;

  @Column({ default: false })
  is_blacklist: boolean;

  @Exclude()
  @Column({ type: 'int' })
  block_radius: number;

  @Column({ default: 'VN' })
  country: string;

  @Column({ nullable: true })
  province: string;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  commune: string;

  @Column({ nullable: true })
  street: string;

  @Exclude()
  @Column({ nullable: true })
  token_id: number;

  @Exclude()
  @Column({ nullable: true })
  transaction_hash: string;

  @Exclude()
  @Column({ type: 'bigint', nullable: true })
  block_number: number;

  @Exclude()
  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true })
  user_full_name: string;

  @Exclude()
  @Column({ nullable: true })
  approved_by_id: number;

  @Exclude()
  @CreateDateColumn({ nullable: true })
  approved_at: Date;

  @Exclude()
  @Column({ nullable: true })
  paid_at: Date;

  @Column({ default: 1 })
  version: number;

  @Exclude()
  @Column()
  created_by_id: number;

  @Exclude()
  @CreateDateColumn()
  created_at: Date;

  @Exclude()
  @UpdateDateColumn()
  updated_at: Date;

  calculateBounds() {
    Object.assign(
      this,
      getBoundsByRadius(this.lat, this.long, this.block_radius),
    );
  }
}
