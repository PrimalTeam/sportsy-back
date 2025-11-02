import { IsDateString, IsOptional, IsString } from 'class-validator';
import { Game } from 'src/modules/game/entities/game.entity';
import { Room } from 'src/modules/room/entities/room.entity';
import { Team } from 'src/modules/team/entities/team.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TournamentSportTypeEnum {
  FOOTBALL = 'football',
  BASKETBALL = 'basketball',
  PING_PONG = 'ping-pong',
  VOLLEYBALL = 'volleyball',
}

export enum LeaderTypeEnum {
  SINGLE_ELIMINATION = 'single-elimination',
  DOUBLE_ELIMINATION = 'double-elimination',
  ROUND_ROBIN = 'round-robin',
  SWISS = 'swiss',
  POOL_PLAY = 'pool-play',
  GROUP_STAGE = 'group-stage',
  KNOCKOUT = 'knockout',
  PLAYOFFS = 'playoffs',
  CONFERENCE = 'conference',
  LEAGUE = 'league',
}

export class TournamentInfo {
  @ApiProperty({ description: 'Detailed description of the tournament.' })
  @Column()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Title of the tournament.' })
  @Column()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Start date of the tournament.',
    type: String,
    format: 'date-time',
  })
  @Column({ default: () => 'CURRENT_TIMESTAMP', nullable: true })
  @IsDateString()
  @IsOptional()
  dateStart?: Date;

  @ApiPropertyOptional({
    description: 'End date of the tournament.',
    type: String,
    format: 'date-time',
  })
  @Column({ nullable: true })
  @IsDateString()
  @IsOptional()
  dateEnd?: Date;
}

@Entity('tournaments')
export class Tournament {
  @ApiProperty({ description: 'Unique identifier of the tournament.' })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({
    description: 'Sport type of the tournament.',
    enum: TournamentSportTypeEnum,
  })
  @Column({
    type: 'enum',
    enum: TournamentSportTypeEnum,
    default: TournamentSportTypeEnum.FOOTBALL,
  })
  sportType: TournamentSportTypeEnum;

  @ApiProperty({
    description: 'Structured information about the tournament.',
    type: () => TournamentInfo,
  })
  @Column(() => TournamentInfo)
  info: TournamentInfo;

  @ApiPropertyOptional({
    description: 'Serialized representation of the tournament leader tree.',
  })
  @Column({
    type: 'json',
    default: '{}',
    transformer: {
      to: (value: Record<string, unknown>) => JSON.stringify(value),
      from: (_value: string) => {},
    },
  })
  leader: string;

  @ApiProperty({
    description: 'Type of leader structure.',
    enum: LeaderTypeEnum,
  })
  @Column({
    type: 'enum',
    enum: LeaderTypeEnum,
    default: LeaderTypeEnum.SINGLE_ELIMINATION,
  })
  leaderType: LeaderTypeEnum;

  @ApiProperty({
    description: 'Room associated with the tournament.',
    type: () => Room,
  })
  @OneToOne(() => Room, (room) => room.tournament, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId', referencedColumnName: 'id' })
  room: Room;

  @ApiProperty({
    description: 'Identifier of the room associated with the tournament.',
  })
  @Column()
  roomId: number;

  @ApiProperty({
    description: 'Teams participating in the tournament.',
    type: () => [Team],
  })
  @OneToMany(() => Team, (team) => team.tournament, { cascade: true })
  teams: Team[];

  @ApiProperty({
    description: 'Games scheduled in the tournament.',
    type: () => [Game],
  })
  @OneToMany(() => Game, (game) => game.tournament, { cascade: true })
  games: Game[];
}

const leader = {
  name: 'final',
  description: 'Final',
  teams: [],
  children: [
    {
      name: 'semi-final1',
      description: 'Semi-final 1',
      teams: [],
      childrens: [],
    },
    {
      name: 'semi-final2',
      description: 'Semi-final 2',
      teams: [],
      childrens: [],
    },
  ],
};

const _leaderPayload = {
  leader: leader,
  typeOfLeader: LeaderTypeEnum.SINGLE_ELIMINATION,
};
