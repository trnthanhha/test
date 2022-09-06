import {
    Column, CreateDateColumn,
    Entity, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';


export enum PaymentStatus {
    PENDING = 'pending',
    UNAUTHORIZED = 'unauthorized',
    PAID = 'paid',
    CANCELLED = 'cancelled'
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    payment_status: PaymentStatus

    @Column({ type: 'double precision'})
    price: number

    @Column()
    location_id: number;

    @Column()
    created_by_id: number;
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
}
