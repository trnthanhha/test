import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Package {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  quantity: number;

  @Column({ type: 'double precision', nullable: true })
  promotion: number;

  @Column({ type: 'double precision', nullable: true })
  discount: number;

  @Column({ default: 1 })
  version: number;

  @Column({ nullable: true })
  price_usd: number;

  @Column({ nullable: true })
  price_loca: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  price: number;
}
