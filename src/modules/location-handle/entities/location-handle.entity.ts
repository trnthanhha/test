import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity()
export class LocationHandle {
  @PrimaryColumn()
  name: string;

  @Column()
  @Generated('increment')
  total: number;
}
