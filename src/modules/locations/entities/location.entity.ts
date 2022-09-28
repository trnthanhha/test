import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  LocationNFTStatus,
  LocationPurchaseStatus,
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

  @Column({ nullable: true })
  map_captured: string;

  @Column({ type: 'double precision' })
  long: number;

  @Column({ type: 'double precision' })
  lat: number;

  @Exclude()
  @Index()
  @Column({ type: 'double precision' })
  safe_zone_top: number;

  @Exclude()
  @Index()
  @Column({ type: 'double precision' })
  safe_zone_bot: number;

  @Exclude()
  @Index()
  @Column({ type: 'double precision' })
  safe_zone_left: number;

  @Exclude()
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
  @Column({ type: 'enum', enum: LocationPurchaseStatus, nullable: true })
  purchase_status: LocationPurchaseStatus;

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

  @Exclude()
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

  @Exclude()
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  calculateBounds() {
    Object.assign(
      this,
      getBoundsByRadius(this.lat, this.long, this.block_radius),
    );
  }

  canPurchased(): boolean {
    return (
      !this.is_blacklist &&
      !this.user_id &&
      !this.user_full_name &&
      !this.purchase_status &&
      this.status === LocationStatus.APPROVED
    );
  }
}
