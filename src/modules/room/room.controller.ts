import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
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
import { UpdateRoomDto } from './dto/updateRoom.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Room } from './entities/room.entity';
import { RoomUser } from '../roomUser/entities/roomUser.entity';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('rooms')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @ApiOperation({
    summary: 'Create a new room with optional tournament and participants.',
  })
  @ApiCreatedResponse({ description: 'Room created successfully.', type: Room })
  @ApiBearerAuth()
  @ApiBody({ type: CreateRoomDto })
  @Post('create')
  @UseGuards(JwtGuard)
  async createRoom(
    @UserFromRequest() user: AccessTokenPayload,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    return this.roomService.createRoom(createRoomDto, user.sub);
  }

  @ApiOperation({ summary: 'Get rooms the authenticated user belongs to.' })
  @ApiOkResponse({
    description: 'List of rooms for the current user.',
    type: Room,
    isArray: true,
  })
  @ApiBearerAuth()
  @Get('userRooms')
  @UseGuards(JwtGuard)
  async getUserRooms(@UserFromRequest() user: AccessTokenPayload) {
    return this.roomService.getUserRooms(user.sub);
  }

  @ApiOperation({ summary: 'List users participating in a room.' })
  @ApiOkResponse({
    description: 'List of users assigned to the room.',
    type: RoomUser,
    isArray: true,
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @Get('users/:roomId')
  @RoomRole()
  @UseGuards(JwtGuard, RoomGuard)
  async getUsersOfRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.roomService.getUsersOfRoom(roomId);
  }

  @ApiOperation({ summary: 'Delete a room by its identifier.' })
  @ApiOkResponse({ description: 'Room deleted successfully.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @Delete('/:roomId')
  @RoomRole(RoomUserRole.ADMIN)
  @UseGuards(JwtGuard, RoomGuard)
  async deleteRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    this.roomService.checkEntityExistenceById(roomId);
    return this.roomService.deleteRoomById(roomId);
  }

  @ApiOperation({ summary: 'Get a room with optional related entities.' })
  @ApiQuery({
    name: 'include',
    required: false,
    description: 'Relations to include.',
    type: [String],
  })
  @ApiOkResponse({ description: 'Requested room with relations.', type: Room })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @Get('/:roomId')
  @RoomRole()
  @UseGuards(JwtGuard, RoomGuard)
  async getRoom(
    @Query('include') includes: string[] | string,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    const includesArray = (
      Array.isArray(includes) ? includes : [includes]
    ).filter((value): value is string => Boolean(value));
    const room = await this.roomService.findByIdWithRelations(
      roomId,
      includesArray,
    );
    this.roomService.verifyEntityFind(room);
    return room;
  }

  @ApiOperation({ summary: 'Update room details.' })
  @ApiOkResponse({ description: 'Updated room data.', type: Room })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiBody({ type: UpdateRoomDto })
  @Patch('/:roomId')
  @RoomRole()
  @UseGuards(JwtGuard, RoomGuard)
  async updateRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.updateRoomById(roomId, updateRoomDto);
  }
}
