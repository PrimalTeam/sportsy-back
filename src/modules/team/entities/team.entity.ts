import { BaseEntity } from 'src/interfaces/base.entity';
import { TeamUser } from 'src/modules/teamUser/entities/teamUser.entity';
import { Tournament } from 'src/modules/tournament/entities/tournament.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('teamUsers')
export class Team extends BaseEntity {
  @Column('bytea', { nullable: true })
  icon?: Buffer;

  @Column()
  name?: string;

  @ManyToOne(() => Tournament, (tournament) => tournament.teams, {
    onDelete: 'CASCADE',
  })
  tournament: Tournament;

  @OneToMany(() => TeamUser, (teamUser) => teamUser.team, { cascade: true })
  teamUsers: TeamUser[];
}
