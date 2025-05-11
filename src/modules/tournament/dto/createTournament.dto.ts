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
import { CreateTeamDto } from 'src/modules/team/dto/createTeam.dto';

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

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => CreateTeamDto)
  readonly teams?: CreateTeamDto[];
}

export class GenerateTournamentDto extends CreateTournamentDto {
  @IsOptional()
  @IsNumber()
  readonly roomId?: number;
}
