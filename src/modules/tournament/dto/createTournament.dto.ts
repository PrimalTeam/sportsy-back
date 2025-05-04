import {
  LeaderTypeEnum,
  TournamentInfo,
  TournamentSportTypeEnum,
} from '../entities/tournament.entity';

export class CreateTournamentDto {
  readonly info: TournamentInfo;
  readonly sportType?: TournamentSportTypeEnum;
  readonly leaderType?: LeaderTypeEnum;
}

export class GenerateTournamentDto {
  readonly info: TournamentInfo;
  readonly sportType?: TournamentSportTypeEnum;
  readonly leaderType?: LeaderTypeEnum;
  readonly roomId?: number;
}
