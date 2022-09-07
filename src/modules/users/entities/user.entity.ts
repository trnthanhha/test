import {
    Column, CreateDateColumn,
    Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import {UserType} from "../users.constants";
import Device from "../../device/entities/device.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    password: string

    @Column({ unique: true })
    phone_number: string;

    @Column({ unique: true })
    email: string;

    @Column({ type: 'enum', enum: UserType })
    type: UserType;

    @Column({ nullable: true })
    refresh_token: string;

    @OneToMany(() => Device, (device) => device.user)
    devices: Device[];

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