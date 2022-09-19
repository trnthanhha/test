import { Column, Entity } from "typeorm";


@Entity()
export class ContractEntity {
    @Column({ name: 'location_id' })
    location_id: number;

    @Column({ name: 'buyer'})
    buyer_id: number;

    @Column({ name: 'owner_id' })
    owner_id: number;
}