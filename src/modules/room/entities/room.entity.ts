import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoomUser } from '../../roomUser/entities/roomUser.entity';
import { Tournament } from 'src/modules/tournament/entities/tournament.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('rooms')
export class Room {
  @ApiProperty({ description: 'Unique identifier of the room.' })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: 'Display name of the room.' })
  @Column()
  name: string;

  @ApiPropertyOptional({ description: 'Binary icon for the room.' })
  @Column('bytea', { nullable: true })
  icon?: Buffer;

  @ApiProperty({
    description: 'Users assigned to the room.',
    type: () => [RoomUser],
  })
  @OneToMany(() => RoomUser, (roomUser) => roomUser.room, {
    cascade: true,
  })
  roomUsers: RoomUser[];

  @ApiProperty({
    description: 'Tournament associated with the room.',
    type: () => Tournament,
  })
  @OneToOne(() => Tournament, (tournament) => tournament.room, {
    cascade: true,
  })
  tournament: Tournament;
}
