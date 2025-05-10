import { SetMetadata } from '@nestjs/common';
import { RoomUserRole } from 'src/modules/roomUser/entities/roomUser.entity';

export const ROOMROLE_KEY = 'roomRole';
export const RoomRole = (...roomRoles: RoomUserRole[]) =>
  SetMetadata(ROOMROLE_KEY, roomRoles);
