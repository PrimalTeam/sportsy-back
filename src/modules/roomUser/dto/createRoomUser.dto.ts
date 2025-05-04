import { UserIdentifierType } from 'src/modules/user/entities/user.entity';
import { RoomUserRole } from '../entities/roomUser.entity';

export interface RoomUserFindOptions{
  readonly identifier: string;
  readonly identifierType: UserIdentifierType;
}

export class CreateRoomUserDto implements RoomUserFindOptions {
  readonly role: RoomUserRole;
  readonly identifier: string;
  readonly identifierType: UserIdentifierType;
}

export class GenerateRoomUserDto implements RoomUserFindOptions {
  readonly roomId?: number;
  readonly identifier: string;
  readonly identifierType: UserIdentifierType;
  readonly role: RoomUserRole;
}
