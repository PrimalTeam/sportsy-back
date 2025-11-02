import {
  IsEnum,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { GameStatusEnum } from '../entities/game.entity';
import { Type } from 'class-transformer';
import { CreateTeamStatusDto } from 'src/modules/teamStatus/dto/createTeamStatus.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiPropertyOptional({
    description: 'Status of the game.',
    enum: GameStatusEnum,
  })
  @IsOptional()
  @IsEnum(GameStatusEnum)
  status?: GameStatusEnum;

  @ApiPropertyOptional({
    description: 'Planned start date of the game.',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  dateStart?: Date;

  @ApiPropertyOptional({
    description: 'Duration of the game (ISO 8601 interval).',
    example: '01:30:00',
  })
  @IsString()
  durationTime?: string;

  @ApiProperty({
    description: 'Identifiers of the teams participating.',
    type: [Number],
  })
  @IsNumber({}, { each: true })
  @IsArray()
  @IsNotEmpty()
  teamIds: number[];

  @ApiPropertyOptional({
    description: 'Optional list of team statuses for the game.',
    type: () => [CreateTeamStatusDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateTeamStatusDto)
  @IsOptional()
  teamStatuses?: CreateTeamStatusDto[];
}

export class GenerateGameDto extends CreateGameDto {
  @ApiPropertyOptional({
    description: 'Tournament identifier associated with the game.',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  tournamentId?: number;
}
