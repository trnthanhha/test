import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../users.constants';
import { Exclude } from 'class-transformer';
import { StandardPriceHistory } from '../../standard-price/entities/standard-price-history.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true, nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  full_name: string;

  @Exclude()
  @Column()
  password: string;

  @Exclude()
  @Column({ nullable: true })
  identification_number: string;

  @Exclude()
  @Column({ nullable: true })
  identification_created_at: Date;

  @Exclude()
  @Column({ type: 'enum', enum: UserType })
  type: UserType;

  @Exclude()
  @Column({ nullable: true })
  refresh_token: string;

  @Exclude()
  @Column({ nullable: true })
  locamos_access_token: string;

  @Column({ nullable: true })
  ref_user_id: number;

  @Column({ default: false })
  is_kyc_verified: boolean;

  @Exclude()
  @Column({ nullable: true })
  created_by_id: number;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => StandardPriceHistory, (s) => s.user, {
    onDelete: 'CASCADE',
  })
  standard_price_historys?: StandardPriceHistory[];
}
