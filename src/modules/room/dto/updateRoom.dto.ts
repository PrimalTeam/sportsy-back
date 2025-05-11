import { DeepPartial } from 'typeorm';
import { CreateRoomDto } from './createRoom.dto';

export type UpdateRoomDto = DeepPartial<CreateRoomDto>;
