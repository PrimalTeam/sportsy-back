import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { GameStatusEnum } from '../entities/game.entity';

export class UpdateGameDto {
  @IsOptional()
  @IsEnum(GameStatusEnum)
  status?: GameStatusEnum;

  @IsDateString()
  dateStart?: Date;

  @IsString()
  durationTime?: string;
}
