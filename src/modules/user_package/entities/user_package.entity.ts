import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UPackagePurchaseStatus } from '../user_package.constants';
import { User } from '../../users/entities/user.entity';

@Entity()
export class UserPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  ref_id: string;

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

  @Column({ default: 1 })
  version: number;

  @Column({ nullable: true })
  created_by_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  owner?: User | string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
  buyer?: User | string;

  owner_id: number;
  buyer_id: number;

  isUsable(): boolean {
    return (
      this.remaining_quantity &&
      this.remaining_quantity > 0 &&
      this.purchase_status === UPackagePurchaseStatus.PAID
    );
  }
}
