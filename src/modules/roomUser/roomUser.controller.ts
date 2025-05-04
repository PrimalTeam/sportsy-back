import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoomUserService } from './roomUser.service';
import { JwtGuard } from 'src/guards/auth.guard';
import { RoomGuard } from 'src/guards/room.guard';
import { Room } from '../room/entities/room.entity';
import { RoomRole } from 'src/decorators/roomRole.decorator';
import { RoomUserRole } from './entities/roomUser.entity';
import { create } from 'domain';
import { CreateRoomUserDto } from './dto/createRoomUser.dto';

@Controller('roomUser')
export class RoomUserController {
  constructor(private readonly roomUserService: RoomUserService) {}

  @Post('addUser/:roomId')
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  async addUserToRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() createRoomUserDto: CreateRoomUserDto,
  ) {
    return await this.roomUserService.addRoomUser(createRoomUserDto, roomId);
  }

  @Get('/:roomId/:userId')
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  async getRoomUser(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.roomUserService.findByUserAndRoomId({ roomId, userId });
  }
}
