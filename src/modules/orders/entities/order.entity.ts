import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus, PaymentType } from '../orders.constants';
import { Location } from '../../locations/entities/location.entity';
import { User } from '../../users/entities/user.entity';
import { UserPackage } from '../../user_package/entities/user_package.entity';

@Unique('location_package', ['location_id', 'user_package_id'])
@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  ref_uid: string;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.CASH,
  })
  payment_type: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNAUTHORIZED,
  })
  payment_status: PaymentStatus;

  @Column({ type: 'double precision' })
  price: number;

  @Column()
  note: string;

  @Column({ default: 0, nullable: false })
  location_id: number;

  @Column({ default: 0, nullable: false })
  user_package_id: number;

  @Column({ default: 1 })
  version: number;

  @Column()
  created_by_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @JoinColumn({ name: 'location_id' })
  location?: Location;

  @JoinColumn({ name: 'package_id' })
  user_package?: UserPackage;
}
