import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BillStatus, PaymentVendor } from '../bills.constants';
import { Order } from '../../orders/entities/order.entity';
import { UserPackage } from '../../user_package/entities/user_package.entity';

@Entity()
export class Bill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ref_id: string;

  @Column()
  order_id: number;

  @Column({
    type: 'enum',
    enum: BillStatus,
    default: BillStatus.UNAUTHORIZED,
  })
  status: BillStatus;

  @Column({ type: 'enum', enum: PaymentVendor, default: PaymentVendor.VNPAY })
  vendor: PaymentVendor;

  @Column({ nullable: true })
  invoice_number: string;

  @Column({ default: 1 })
  version: number;

  @Column()
  created_by_id: number;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;

  // ---------------- Relations
  @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order?: Order;
}
