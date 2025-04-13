import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RoomUserService } from './roomUser.service';
import { JwtGuard } from 'src/guards/auth.guard';
import { RoomGuard } from 'src/guards/room.guard';
import { Room } from '../room/entities/room.entity';
import { RoomRole } from 'src/decorators/roomRole.decorator';
import { RoomUserRole } from './entities/roomUser.entity';

@Controller('roomUser')
export class RoomUserController {
  constructor(private readonly roomUserService: RoomUserService) {}

  @Get('/:roomId/:userId')
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  async getRoomUser(
    @Param('roomId') roomId: number,
    @Param('userId') userId: number,
  ) {
    return await this.roomUserService.findByUserAndRoomId({ roomId, userId });
  }
}
