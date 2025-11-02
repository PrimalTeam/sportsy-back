import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { GameStatusEnum } from '../entities/game.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGameDto {
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
    example: '01:45:00',
  })
  @IsString()
  durationTime?: string;
}
