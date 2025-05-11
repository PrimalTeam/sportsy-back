import { IsNumber, IsOptional } from 'class-validator';

export class CreateTeamStatusDto {
  @IsOptional()
  @IsNumber()
  score?: number;
}

export class GenerateTeamStatusDto extends CreateTeamStatusDto {
  @IsOptional()
  @IsNumber()
  gameId: number;

  @IsOptional()
  @IsNumber()
  teamId: number;
}
