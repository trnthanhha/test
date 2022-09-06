import {
    Column, CreateDateColumn,
    Entity, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

enum UserType {
    ADMIN = 'admin',
    CUSTOMER = 'customer'
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ type: 'enum', enum: UserType })
    type: UserType;

    @Column()
    ref_user_id: number;

    @Column()
    is_kyc_verified: boolean;

    @Column()
    created_by_id: number;
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
}