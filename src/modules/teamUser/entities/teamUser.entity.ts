import { BaseEntity } from 'src/interfaces/base.entity';
import { Team } from 'src/modules/team/entities/team.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('teamUsers')
export class TeamUser extends BaseEntity {
  @Column()
  name?: string;

  @Column()
  surname?: string;

  @Column()
  username?: string;

  @ManyToOne(() => Team, (team) => team.teamUsers, { onDelete: 'CASCADE' })
  team: Team;
}
