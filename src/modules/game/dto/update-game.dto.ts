import { IsOptional, IsEnum, IsString, IsNumber } from 'class-validator';
import { GameStatusEnum } from '../game-status.enum';

export class UpdateGameDto {
  @IsOptional()
  @IsNumber({}, { each: true })
  teamStatuses?: number[];

  @IsOptional()
  @IsEnum(GameStatusEnum)
  status?: GameStatusEnum;

  @IsOptional()
  @IsNumber()
  dateStart?: number;

  @IsOptional()
  @IsString()
  durationTime?: string;

  @IsOptional()
  gameActions?: string[];

  @IsOptional()
  @IsNumber()
  tournamentId?: number;
}
