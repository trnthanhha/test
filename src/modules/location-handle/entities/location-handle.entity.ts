import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class LocationHandle {
  @PrimaryColumn()
  name: string;

  @Column()
  total: number;
}
