import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamStatusDto {
  @ApiPropertyOptional({
    description: 'Score assigned to the team.',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  score?: number;
}

export class GenerateTeamStatusDto extends CreateTeamStatusDto {
  @ApiPropertyOptional({
    description: 'Identifier of the game to attach status to.',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  gameId: number;

  @ApiPropertyOptional({ description: 'Identifier of the team.', example: 10 })
  @IsOptional()
  @IsNumber()
  teamId: number;
}

export class UpdateTeamStatusScoreDto {
  @ApiProperty({ description: 'Score assigned to the team.', example: 5 })
  @IsNumber()
  score: number;
}
