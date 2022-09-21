import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus } from '../orders.constants';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  ref_uid: string;

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

  @Column()
  location_id: number;

  @Column({ default: 1 })
  version: number;

  @Column()
  created_by_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
