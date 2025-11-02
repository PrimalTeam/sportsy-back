import { BaseEntity } from 'src/interfaces/base.entity';
import { Game } from 'src/modules/game/entities/game.entity';
import { Team } from 'src/modules/team/entities/team.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('teamStatuses')
export class TeamStatus extends BaseEntity {
  @ApiProperty({ description: 'Score achieved by the team.' })
  @Column({ type: 'float', default: 0 })
  score: number;

  @ApiProperty({ description: 'Identifier of the related game.' })
  @Column()
  gameId: number;

  @ApiProperty({
    description: 'Game associated with this status.',
    type: () => Game,
  })
  @ManyToOne(() => Game, (game) => game.teamStatuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @ApiProperty({ description: 'Identifier of the related team.' })
  @Column()
  teamId: number;

  @ApiProperty({
    description: 'Team associated with this status.',
    type: () => Team,
  })
  @ManyToOne(() => Team, (team) => team.teamStatuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: Team;
}
