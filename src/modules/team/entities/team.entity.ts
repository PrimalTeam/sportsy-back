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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('teams')
export class Team extends BaseEntity {
  @ApiPropertyOptional({ description: 'Icon representing the team.' })
  @Column('bytea', { nullable: true })
  icon?: Buffer;

  @ApiPropertyOptional({ description: 'Display name of the team.' })
  @Column()
  name?: string;

  @ApiProperty({
    description: 'Tournament associated with the team.',
    type: () => Tournament,
  })
  @ManyToOne(() => Tournament, (tournament) => tournament.teams, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tournamentId' })
  tournament: Tournament;

  @ApiProperty({
    description: 'Identifier of the tournament the team belongs to.',
  })
  @Column()
  tournamentId: number;

  @ApiProperty({
    description: 'Players assigned to the team.',
    type: () => [TeamUser],
  })
  @OneToMany(() => TeamUser, (teamUser) => teamUser.team, { cascade: true })
  teamUsers: TeamUser[];

  @ApiProperty({
    description: 'Games the team participates in.',
    type: () => [Game],
  })
  @ManyToMany(() => Game, (game) => game.teams, {
    // cascade: true,
    onDelete: 'CASCADE',
  })
  games: Game[];

  @ApiProperty({
    description: 'Statuses recorded for the team.',
    type: () => [TeamStatus],
  })
  @OneToMany(() => TeamStatus, (teamStatus) => teamStatus.team, {})
  teamStatuses: TeamStatus[];
}
