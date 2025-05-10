import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { GameStatusEnum } from '../game-status.enum';

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

  @Column({ type: 'date' })
  dateStart: Date;

  @Column()
  durationTime: string;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  gameActions: string[];

  // @ManyToOne(() => Tournament, (tournament) => tournament.games)
  // @JoinColumn({ name: 'tournamentId' })
  // tournament: Tournament;
}
