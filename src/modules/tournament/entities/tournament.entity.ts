import { Room } from 'src/modules/room/entities/room.entity';
import {
  Column,
  Entity,
  JoinColumn,
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
  description: string;

  @Column()
  title: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  dateStart?: Date;

  @Column()
  DateEnd?: Date;
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
      to: (value: Record<string, any>) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value),
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

const leaderPayload = {
  leader: leader,
  typeOfLeader: LeaderTypeEnum.SINGLE_ELIMINATION,
};
