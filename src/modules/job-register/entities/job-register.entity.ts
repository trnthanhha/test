import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class JobRegister {
  @PrimaryColumn()
  name: string;

  @Column()
  is_process: boolean;
}
