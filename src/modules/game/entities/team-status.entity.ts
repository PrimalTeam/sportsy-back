import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class TeamStatus {
  @PrimaryGeneratedColumn()
  id: number;

  //   @ManyToOne(() => Team, team => team.teamStatuses)
  //   @JoinColumn({ name: 'teamId' })
  //   team: Team;

  // @ManyToOne(() => Game, (game) => game.teamStatuses)
  // @JoinColumn({ name: 'gameId' })
  // game: Game;

  @Column({ type: 'float' })
  score: number;
}
