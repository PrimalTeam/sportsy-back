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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTournamentDto {
  @ApiProperty({
    description: 'Core information about the tournament.',
    type: () => TournamentInfo,
  })
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => TournamentInfo)
  readonly info: TournamentInfo;

  @ApiPropertyOptional({
    description: 'Sport type of the tournament.',
    enum: TournamentSportTypeEnum,
  })
  @IsOptional()
  @IsEnum(TournamentSportTypeEnum)
  readonly sportType?: TournamentSportTypeEnum;

  @ApiPropertyOptional({
    description: 'Leader representation type.',
    enum: LeaderTypeEnum,
  })
  @IsOptional()
  @IsEnum(LeaderTypeEnum)
  readonly leaderType?: LeaderTypeEnum;

  @ApiPropertyOptional({
    description: 'Teams initialized with the tournament.',
    type: () => [CreateTeamDto],
  })
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => CreateTeamDto)
  readonly teams?: CreateTeamDto[];
}

export class GenerateTournamentDto extends CreateTournamentDto {
  @ApiPropertyOptional({
    description: 'Room identifier used when generating a default tournament.',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  readonly roomId?: number;
}
