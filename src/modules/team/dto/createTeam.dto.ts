import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiPropertyOptional({
    description:
      'Team icon as a base64-encoded image (a data URI is also accepted). Send null to remove it.',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  icon?: string | null;

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
