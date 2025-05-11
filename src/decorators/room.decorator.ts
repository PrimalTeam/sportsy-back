import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Room } from 'src/modules/room/entities/room.entity';

export const RoomFromRequest = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): Room | string | number => {
    const request = ctx.switchToHttp().getRequest();
    if (request.room) return data ? request.room[data] : request.room;
  },
);
