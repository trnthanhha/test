import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column({ default: false })
  is_paid: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
