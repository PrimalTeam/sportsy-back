import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoomUserService } from './roomUser.service';
import { JwtGuard } from 'src/guards/auth.guard';
import { RoomGuard } from 'src/guards/room.guard';
import { RoomRole } from 'src/decorators/roomRole.decorator';
import { RoomUserRole } from './entities/roomUser.entity';
import {
  CreateRoomUserDto,
  GenerateRoomUserDto,
} from './dto/createRoomUser.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RoomUser } from './entities/roomUser.entity';

@ApiTags('room-users')
@Controller('roomUser')
export class RoomUserController {
  constructor(private readonly roomUserService: RoomUserService) {}

  @ApiOperation({ summary: 'List available room user roles.' })
  @ApiOkResponse({
    description: 'Supported room user roles.',
    type: String,
    isArray: true,
  })
  @Get('roles')
  async getRoomUserRoles() {
    return this.roomUserService.getRoomUserRoles();
  }

  @ApiOperation({ summary: 'Add a user to the specified room.' })
  @ApiOkResponse({
    description: 'Room user added successfully.',
    type: RoomUser,
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiBody({ type: CreateRoomUserDto })
  @Post('addUser/:roomId')
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  async addUserToRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() createRoomUserDto: CreateRoomUserDto,
  ) {
    return await this.roomUserService.addRoomUser(createRoomUserDto, roomId);
  }

  @ApiOperation({ summary: 'Get a room user by room and user identifiers.' })
  @ApiOkResponse({ description: 'Room user returned.', type: RoomUser })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiParam({ name: 'userId', type: Number })
  @Get('/:roomId/:userId')
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  async getRoomUser(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.roomUserService.findByUserAndRoomId({ roomId, userId });
  }

  @ApiOperation({ summary: 'Change a user role within a room.' })
  @ApiOkResponse({ description: 'Room user role updated.', type: RoomUser })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiBody({ type: GenerateRoomUserDto })
  @Patch('/:roomId')
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  async changeRoomUserRole(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() generateRoomUserDto: GenerateRoomUserDto,
  ) {
    return this.roomUserService.changeRoomUserRole({
      ...generateRoomUserDto,
      roomId,
    });
  }

  @ApiOperation({ summary: 'Remove a room user from the room.' })
  @ApiOkResponse({ description: 'Room user removed successfully.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiParam({ name: 'roomUserId', type: Number })
  @Delete('/:roomId/:roomUserId')
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  async deleteRoomUser(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('roomUserId', ParseIntPipe) roomUserId: number,
  ) {
    return this.roomUserService.deleteRoomUser(roomId, roomUserId);
  }
}
