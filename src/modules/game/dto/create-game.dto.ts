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

  @ValidateNested({ each: true })
  @Type(() => CreateTeamStatusDto)
  @IsOptional()
  teamStatuses?: CreateTeamStatusDto[];
}

export class GenerateGameDto extends CreateGameDto {
  @IsOptional()
  @IsNumber()
  tournamentId?: number;
}
