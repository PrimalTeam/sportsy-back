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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GameStatusEnum {
  PENDING = 'Pending',
  IN_PROGRESS = 'In progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

@Entity()
export class Game {
  @ApiProperty({ description: 'Unique identifier of the game.' })
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToMany(() => TeamStatus)
  // @JoinTable()
  // teamStatuses: TeamStatus[];

  @ApiProperty({
    description: 'Current status of the game.',
    enum: GameStatusEnum,
  })
  @Column({
    type: 'enum',
    enum: GameStatusEnum,
    default: GameStatusEnum.PENDING,
  })
  status: GameStatusEnum;

  @ApiPropertyOptional({
    description: 'Scheduled start date for the game.',
    type: String,
    format: 'date-time',
  })
  @Column({ type: 'date', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  dateStart?: Date;

  @ApiPropertyOptional({
    description: 'Duration of the game in ISO interval.',
    example: '01:30:00',
  })
  @Column({ type: 'interval', nullable: true })
  durationTime?: string;

  @ApiProperty({
    description: 'Identifier of the tournament the game belongs to.',
  })
  @Column()
  tournamentId: number;

  @ApiProperty({
    description: 'Tournament associated with the game.',
    type: () => Tournament,
  })
  @ManyToOne(() => Tournament, (tournament) => tournament.games, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tournamentId' })
  tournament: Tournament;

  @ApiProperty({
    description: 'Teams participating in the game.',
    type: () => [Team],
  })
  @ManyToMany(() => Team, (team) => team.games, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinTable()
  teams: Team[];

  @ApiProperty({
    description: 'Identifiers of the teams participating in the game.',
    type: [Number],
  })
  @RelationId((game: Game) => game.teams)
  teamIds: number[];

  @ApiProperty({
    description: 'Statuses linked to the game.',
    type: () => [TeamStatus],
  })
  @OneToMany(() => TeamStatus, (teamStatus) => teamStatus.game, {
    cascade: true,
  })
  teamStatuses: TeamStatus[];
}
