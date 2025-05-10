import { UserIdentifierType } from 'src/modules/user/entities/user.entity';
import { RoomUserRole } from '../entities/roomUser.entity';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export interface RoomUserFindOptions {
  readonly identifier: string;
  readonly identifierType: UserIdentifierType;
}

export class CreateRoomUserDto implements RoomUserFindOptions {
  @IsEnum(RoomUserRole)
  @IsOptional()
  readonly role?: RoomUserRole;

  @IsString()
  readonly identifier: string;

  @IsEnum(UserIdentifierType)
  readonly identifierType: UserIdentifierType;
}

export class GenerateRoomUserDto implements RoomUserFindOptions {
  readonly roomId?: number;
  readonly identifier: string;
  readonly identifierType: UserIdentifierType;
  readonly role: RoomUserRole;
}
