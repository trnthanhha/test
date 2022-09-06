import {Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Location {
    @PrimaryGeneratedColumn()
    id: number;
}
