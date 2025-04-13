import { RoomUserRole } from '../entities/roomUser.entity';

export class CreateRoomUserDto {
  readonly role: RoomUserRole;
  readonly roomId: number;
}

export class GenerateRoomUserDto {
  readonly userId?: number;
  readonly roomId?: number;
  readonly role: RoomUserRole;
}
