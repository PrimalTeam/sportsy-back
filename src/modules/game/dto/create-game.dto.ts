import {
  IsEnum,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsNotEmpty,
  IsArray,
} from 'class-validator';
import { GameStatusEnum } from '../entities/game.entity';

export class CreateGameDto {
  @IsOptional()
  @IsEnum(GameStatusEnum)
  status?: GameStatusEnum;

  @IsDateString()
  dateStart?: Date;

  @IsString()
  durationTime?: string;

  @IsNumber({}, { each: true })
  @IsArray()
  @IsNotEmpty()
  teamIds: number[];
}

export class GenerateGameDto extends CreateGameDto {
  @IsOptional()
  @IsNumber()
  tournamentId?: number;
}
