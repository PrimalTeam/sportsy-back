import { BaseEntity } from 'src/interfaces/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('teamStatuses')
export class TeamStatus extends BaseEntity {
  @Column('bytea', { nullable: true })
  icon?: Buffer;

  @Column({ type: 'float' })
  score: number;
}
