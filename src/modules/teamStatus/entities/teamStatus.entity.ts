import { BaseEntity } from 'src/interfaces/base.entity';
import { Game } from 'src/modules/game/entities/game.entity';
import { Team } from 'src/modules/team/entities/team.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('teamStatuses')
export class TeamStatus extends BaseEntity {
  @Column({ type: 'float', default: 0 })
  score: number;

  @Column()
  gameId: number;

  @ManyToOne(() => Game, (game) => game.teamStatuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @Column()
  teamId: number;

  @ManyToOne(() => Team, (team) => team.teamStatuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: Team;
}
