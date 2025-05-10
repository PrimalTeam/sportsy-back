import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { JwtGuard } from 'src/guards/auth.guard';
import { UserFromRequest } from 'src/decorators/user.decorator';
import { AccessTokenPayload } from '../auth/models/accessToken';
import { CreateRoomDto } from './dto/createRoom.dto';
import { RoomRole } from 'src/decorators/roomRole.decorator';
import { RoomUserRole } from '../roomUser/entities/roomUser.entity';
import { RoomGuard } from 'src/guards/room.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('create')
  @UseGuards(JwtGuard)
  async createRoom(
    @UserFromRequest() user: AccessTokenPayload,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    return this.roomService.createRoom(createRoomDto, user.sub);
  }

  @Get('userRooms')
  @UseGuards(JwtGuard)
  async getUserRooms(@UserFromRequest() user: AccessTokenPayload) {
    return this.roomService.getUserRooms(user.sub);
  }

  @Get('users/:roomId')
  @RoomRole()
  @UseGuards(JwtGuard, RoomGuard)
  async getUsersOfRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.roomService.getUsersOfRoom(roomId);
  }

  @Delete('/:roomId')
  @RoomRole(RoomUserRole.ADMIN)
  @UseGuards(JwtGuard, RoomGuard)
  async deleteRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    this.roomService.checkEntityExistenceById(roomId);
    return this.roomService.deleteRoomById(roomId);
  }

  @Get('/:roomId')
  @RoomRole()
  @UseGuards(JwtGuard, RoomGuard)
  async getRoom(
    @Query('include') includes: string[] | string,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    includes = Array.isArray(includes) ? includes : [includes];
    const room = await this.roomService.findByIdWithRelations(roomId, includes);
    this.roomService.verifyEntityFind(room);
    return room;
  }
}
