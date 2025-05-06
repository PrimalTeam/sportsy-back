import {
  CreateTournamentDto,
  GenerateTournamentDto,
} from 'src/modules/tournament/dto/createTournament.dto';
import { RoomUser } from '../../roomUser/entities/roomUser.entity';
import { UserIdentifierType } from 'src/modules/user/entities/user.entity';
import { CreateRoomUserDto } from 'src/modules/roomUser/dto/createRoomUser.dto';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  readonly icon?: Buffer;

  @ValidateNested({ each: true })
  @Type(() => CreateRoomUserDto)
  readonly roomUsers?: CreateRoomUserDto[];

  @ValidateNested({ each: true })
  @Type(() => GenerateTournamentDto)
  readonly tournament?: CreateTournamentDto;
}
