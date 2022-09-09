import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../users.constants';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserType })
  type: UserType;

  @Column({ nullable: true })
  refresh_token: string;

  @Column({ nullable: true })
  ref_user_id: number;

  @Column()
  is_kyc_verified: boolean;

  @Column({ nullable: true })
  created_by_id: number;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
