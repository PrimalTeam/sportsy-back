import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import {
  LeaderTypeEnum,
  TournamentInfo,
  TournamentSportTypeEnum,
} from '../entities/tournament.entity';
import { Type } from 'class-transformer';

export class CreateTournamentDto {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => TournamentInfo)
  readonly info: TournamentInfo;

  @IsOptional()
  @IsEnum(TournamentSportTypeEnum)
  readonly sportType?: TournamentSportTypeEnum;

  @IsOptional()
  @IsEnum(LeaderTypeEnum)
  readonly leaderType?: LeaderTypeEnum;
}

export class GenerateTournamentDto {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => TournamentInfo)
  readonly info: TournamentInfo;

  @IsOptional()
  @IsEnum(TournamentSportTypeEnum)
  readonly sportType?: TournamentSportTypeEnum;

  @IsOptional()
  @IsEnum(LeaderTypeEnum)
  readonly leaderType?: LeaderTypeEnum;

  @IsOptional()
  @IsNumber()
  readonly roomId?: number;
}
