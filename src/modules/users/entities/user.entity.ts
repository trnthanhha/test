import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../users.constants';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

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
}
