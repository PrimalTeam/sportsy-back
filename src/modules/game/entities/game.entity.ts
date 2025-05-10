import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { GameStatusEnum } from '../game-status.enum';
import { TeamStatus } from './team-status.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => TeamStatus)
  @JoinTable()
  teamStatuses: TeamStatus[];

  @Column({
    type: 'enum',
    enum: GameStatusEnum,
    default: GameStatusEnum.PENDING,
  })
  status: GameStatusEnum;

  @Column({ type: 'date' })
  dateStart: Date;

  @Column()
  durationTime: string;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  gameActions: string[];

  // @ManyToOne(() => Tournament, tournament => tournament.games)
  // @JoinColumn({ name: 'tournamentId' })
  // tournament: Tournament;
}
