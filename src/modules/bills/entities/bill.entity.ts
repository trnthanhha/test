import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import {PaymentStatus} from "../bills.constants";

enum PaymentVendor {
    VNPAY = 'vnpay'
}

@Entity()
@Unique(['ref_id', 'order_id'])
export class Bill {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ref_id: string;

    @Column()
    order_id: number;

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Column({ type: 'enum', enum: PaymentVendor, default: PaymentVendor.VNPAY })
    vendor: PaymentVendor

    @Column({ nullable: true })
    invoice_number: string;

    @Column()
    created_by_id: number;
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
}
