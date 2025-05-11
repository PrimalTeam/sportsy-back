import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
  RelationId,
} from 'typeorm';
import { Tournament } from 'src/modules/tournament/entities/tournament.entity';
import { Team } from 'src/modules/team/entities/team.entity';
import { TeamStatus } from 'src/modules/teamStatus/entities/teamStatus.entity';

export enum GameStatusEnum {
  PENDING = 'Pending',
  IN_PROGRESS = 'In progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToMany(() => TeamStatus)
  // @JoinTable()
  // teamStatuses: TeamStatus[];

  @Column({
    type: 'enum',
    enum: GameStatusEnum,
    default: GameStatusEnum.PENDING,
  })
  status: GameStatusEnum;

  @Column({ type: 'date', nullable: true })
  dateStart?: Date;

  @Column({ type: 'interval', nullable: true })
  durationTime?: string;

  @Column()
  tournamentId: number;

  @ManyToOne(() => Tournament, (tournament) => tournament.games, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tournamentId' })
  tournament: Tournament;

  @ManyToMany(() => Team, (team) => team.games, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinTable()
  teams: Team[];

  @RelationId((game: Game) => game.teams)
  teamIds: number[];

  @OneToMany(() => TeamStatus, (teamStatus) => teamStatus.game, {
    cascade: true,
  })
  teamStatuses: TeamStatus[];
}
