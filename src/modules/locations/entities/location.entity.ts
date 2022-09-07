import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {LocationNFTStatus, LocationStatus, LocationType} from "../locations.contants";

@Entity()
export class Location {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'double precision'})
    long: number;

    @Column({ type: 'double precision'})
    lat: number;

    @Column({ type: "enum", enum: LocationType })
    type: LocationType;

    @Column({ type: "enum", enum: LocationStatus })
    status: LocationStatus;

    @Column({ type: "enum", enum: LocationNFTStatus })
    nft_status: LocationNFTStatus;

    @Column({ default: false })
    is_blacklist: boolean;

    @Column({ type: "int"})
    block_radius: number;

    @Column()
    transaction_hash: string;

    @Column({ type: "bigint"})
    block_number: number;

    @Column()
    user_id: number


    @Column()
    approved_by_id: number
    @CreateDateColumn()
    approved_at: Date;

    @Column()
    created_by_id: number
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
}
