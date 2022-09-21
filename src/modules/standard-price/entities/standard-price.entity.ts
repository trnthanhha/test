import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class StandardPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'price' })
  price: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'id' })
  user: User;
}
