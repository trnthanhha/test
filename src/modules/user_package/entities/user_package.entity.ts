import {
  Column,
  CreateDateColumn,
  Entity,
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

  @Column()
  remaining_quantity: number;

  @Column({ nullable: true })
  paid_at: Date;

  @Column({
    default: UPackagePurchaseStatus.UNAUTHORIZED,
    type: 'enum',
    enum: UPackagePurchaseStatus,
  })
  purchase_status: UPackagePurchaseStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
