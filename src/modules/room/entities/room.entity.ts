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
import { imageTransformer } from 'src/utils/image-transformer';

@Entity('rooms')
export class Room {
  @ApiProperty({ description: 'Unique identifier of the room.' })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: 'Display name of the room.' })
  @Column()
  name: string;

  @ApiPropertyOptional({
    description: 'Room icon as a base64-encoded image.',
    type: String,
    nullable: true,
  })
  @Column('bytea', { nullable: true, transformer: imageTransformer })
  icon?: string | null;

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
