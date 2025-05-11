import { BaseEntity } from 'src/interfaces/base.entity';
import { Game } from 'src/modules/game/entities/game.entity';
import { TeamStatus } from 'src/modules/teamStatus/entities/teamStatus.entity';
import { TeamUser } from 'src/modules/teamUser/entities/teamUser.entity';
import { Tournament } from 'src/modules/tournament/entities/tournament.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('teams')
export class Team extends BaseEntity {
  @Column('bytea', { nullable: true })
  icon?: Buffer;

  @Column()
  name?: string;

  @ManyToOne(() => Tournament, (tournament) => tournament.teams, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tournamentId' })
  tournament: Tournament;

  @Column()
  tournamentId: number;

  @OneToMany(() => TeamUser, (teamUser) => teamUser.team, { cascade: true })
  teamUsers: TeamUser[];

  @ManyToMany(() => Game, (game) => game.teams, {
    // cascade: true,
    onDelete: 'CASCADE',
  })
  games: Game[];

  @OneToMany(() => TeamStatus, (teamStatus) => teamStatus.team, {})
  teamStatuses: TeamStatus[];
}
