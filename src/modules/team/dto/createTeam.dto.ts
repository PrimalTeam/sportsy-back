import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateTeamDto {
  @IsOptional()
  icon?: Buffer;

  @IsString()
  @IsOptional()
  name?: string;
}

export class GenerateTeamDto extends CreateTeamDto {
  @IsOptional()
  @IsNumber()
  tournamentId?: number;
}
