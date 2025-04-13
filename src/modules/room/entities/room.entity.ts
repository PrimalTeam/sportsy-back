import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RoomUser } from '../../roomUser/entities/roomUser.entity';

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
}
