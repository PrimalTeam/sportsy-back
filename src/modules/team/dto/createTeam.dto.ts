import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiPropertyOptional({ description: 'Team icon in binary form.' })
  @IsOptional()
  icon?: Buffer;

  @ApiPropertyOptional({
    description: 'Team display name.',
    example: 'The Tigers',
  })
  @IsString()
  @IsOptional()
  name?: string;
}

export class GenerateTeamDto extends CreateTeamDto {
  @ApiPropertyOptional({
    description: 'Tournament identifier to associate the team with.',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  tournamentId?: number;
}
