import { IsEnum, IsDate, IsString, IsOptional, IsNumber } from 'class-validator';
import { GameStatusEnum } from '../game-status.enum';

export class CreateGameDto {
  @IsOptional()
  teamStatuses?: number[]; 
  @IsEnum(GameStatusEnum)
  status: GameStatusEnum;
  @IsNumber()
  dateStart: number;
  @IsString()
  durationTime: string;
  @IsOptional()
  gameActions?: string[];
  @IsOptional()
  tournamentId?: number;
   
  @IsOptional()
  @IsNumber()
  tournamentId?: number;
}