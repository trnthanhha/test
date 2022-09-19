import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class StandardPriceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'price_before', nullable: true })
  price_before: number;

  @Column({ name: 'price_after' })
  price_after: number;

  @ManyToOne(() => User, (user) => user.standard_price_historys)
  user?: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
