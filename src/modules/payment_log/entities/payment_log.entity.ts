import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentLogTopic, PaymentLogType } from '../payment_log.type';

@Entity()
export class PaymentLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  topic: PaymentLogTopic;

  @Column({ type: 'enum', enum: PaymentLogType })
  type: PaymentLogType;

  @Column()
  query: string;

  @Column()
  body: string;

  @Column()
  ip: string;

  @Index()
  @CreateDateColumn()
  created_at: Date;
}
