import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoomUser } from '../../roomUser/entities/roomUser.entity';
import { Tournament } from 'src/modules/tournament/entities/tournament.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column('bytea', { nullable: true })
  icon?: Buffer;

  @OneToMany(() => RoomUser, (roomUser) => roomUser.room, {
    cascade: true,
  })
  roomUsers: RoomUser[];

  @OneToOne(() => Tournament, (tournament) => tournament.room, {
    cascade: true,
  })
  tournament: Tournament;
}
