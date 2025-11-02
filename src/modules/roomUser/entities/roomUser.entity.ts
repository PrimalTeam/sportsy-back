import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Room } from '../../room/entities/room.entity';
import { User } from '../../user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum RoomUserRole {
  ADMIN = 'admin',
  SPECTRATOR = 'spectrator',
  GAMEOBSERVER = 'gameObserver',
}

@Entity('room_users')
export class RoomUser {
  @ApiProperty({ description: 'Unique identifier of the room user entry.' })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({
    description: 'Role of the user inside the room.',
    enum: RoomUserRole,
  })
  @Column({
    type: 'enum',
    enum: RoomUserRole,
    default: RoomUserRole.SPECTRATOR,
  })
  role: RoomUserRole;

  @ApiProperty({ description: 'Identifier of the user.' })
  @Column()
  userId: number;

  @ApiProperty({ description: 'Identifier of the room.' })
  @Column()
  roomId: number;

  @ApiProperty({
    description: 'Room associated with the membership.',
    type: () => Room,
  })
  @ManyToOne(() => Room, (room) => room.roomUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId', referencedColumnName: 'id' })
  room: Room;

  @ApiProperty({
    description: 'User associated with the membership.',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.roomUsers)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;
}
