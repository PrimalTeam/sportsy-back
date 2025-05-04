import { GenerateTournamentDto } from 'src/modules/tournament/dto/createTournament.dto';
import { RoomUser } from '../../roomUser/entities/roomUser.entity';
import { UserIdentifierType } from 'src/modules/user/entities/user.entity';
import { CreateRoomUserDto } from 'src/modules/roomUser/dto/createRoomUser.dto';

export class CreateRoomDto {
  readonly name: string;
  readonly icon?: Buffer;
  readonly roomUsers?: CreateRoomUserDto[]
  readonly tournament?: GenerateTournamentDto;
}
