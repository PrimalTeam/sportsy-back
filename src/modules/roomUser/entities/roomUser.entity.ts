import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Room } from '../../room/entities/room.entity';
import { User } from '../../user/entities/user.entity';

export enum RoomUserRole {
  ADMIN = 'admin',
  SPECTRATOR = 'spectrator',
  GAMEOBSERVER = 'gameObserver',
}

@Entity('room_users')
export class RoomUser {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'enum',
    enum: RoomUserRole,
    default: RoomUserRole.SPECTRATOR,
  })
  role: RoomUserRole;

  @Column()
  userId: number;

  @Column()
  roomId: number;

  @ManyToOne(() => Room, (room) => room.roomUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId', referencedColumnName: 'id' })
  room: Room;

  @ManyToOne(() => User, (user) => user.roomUsers)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;
}
