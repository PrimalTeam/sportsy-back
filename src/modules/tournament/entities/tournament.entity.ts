import { IsDateString, IsOptional, IsString } from 'class-validator';
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
  @Column()
  @IsString()
  description: string;

  @Column()
  @IsString()
  title: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  @IsDateString()
  @IsOptional()
  dateStart?: Date;

  @Column()
  @IsDateString()
  @IsOptional()
  dateEnd?: Date;
}

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'enum',
    enum: TournamentSportTypeEnum,
    default: TournamentSportTypeEnum.FOOTBALL,
  })
  sportType: TournamentSportTypeEnum;

  @Column(() => TournamentInfo)
  info: TournamentInfo;

  @Column({
    type: 'json',
    default: '{}',
    transformer: {
      to: (value: Record<string, unknown>) => JSON.stringify(value),
      from: (_value: string) => {},
    },
  })
  leader: string;

  @Column({
    type: 'enum',
    enum: LeaderTypeEnum,
    default: LeaderTypeEnum.SINGLE_ELIMINATION,
  })
  leaderType: LeaderTypeEnum;

  @OneToOne(() => Room, (room) => room.tournament, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId', referencedColumnName: 'id' })
  room: Room;

  @Column()
  roomId: number;

  @OneToMany(() => Team, (team) => team.tournament, { cascade: true })
  teams: Team[];
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
