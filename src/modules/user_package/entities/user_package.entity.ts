import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UPackagePurchaseStatus } from '../user_package.constants';

@Entity()
export class UserPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  package_id: number;

  @Column()
  package_name: string;

  @Column()
  quantity: number;

  @Index()
  @Column()
  remaining_quantity: number;

  @Column()
  price: number;

  @Column({ nullable: true })
  paid_at: Date;

  @Index()
  @Column({
    default: UPackagePurchaseStatus.UNAUTHORIZED,
    type: 'enum',
    enum: UPackagePurchaseStatus,
  })
  purchase_status: UPackagePurchaseStatus;

  @Column()
  version: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  isUsable(): boolean {
    return (
      this.remaining_quantity &&
      this.remaining_quantity > 0 &&
      this.purchase_status === UPackagePurchaseStatus.PAID
    );
  }
}
