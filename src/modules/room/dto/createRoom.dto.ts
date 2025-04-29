import { RoomUser } from '../../roomUser/entities/roomUser.entity';

export class CreateRoomDto {
  readonly name: string;
  readonly icon?: Buffer;
  readonly roomUsers?: RoomUser[];
}
