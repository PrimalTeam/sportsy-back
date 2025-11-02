import {
  Controller,
  Get,
  UseGuards,
  Param,
  NotFoundException,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/guards/auth.guard';
import { UserFromRequest } from 'src/decorators/user.decorator';
import { AccessTokenPayload } from '../auth/models/accessToken';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiExtraModels,
  ApiTags,
} from '@nestjs/swagger';
import { Room } from '../room/entities/room.entity';
import { RoomUserRole } from '../roomUser/entities/roomUser.entity';
import { User } from './entities/user.entity';
import { UserDateInfoDto } from './dto/userDateInfo.dto';

export class RoomWithRoleDto extends Room {
  @ApiProperty({
    description: 'Role of the authenticated user inside the room.',
    enum: RoomUserRole,
  })
  role: RoomUserRole;
}

@UseInterceptors(ClassSerializerInterceptor)
@ApiExtraModels(RoomWithRoleDto)
@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'List rooms for the authenticated user.' })
  @ApiOkResponse({
    description: 'Rooms that the user belongs to.',
    type: RoomWithRoleDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('rooms')
  async getRooms(@UserFromRequest() userFromToken: AccessTokenPayload) {
    return this.userService.getUserRooms(userFromToken.sub);
  }

  @ApiOperation({ summary: 'Retrieve public profile of a user by username.' })
  @ApiOkResponse({ description: 'User profile returned.', type: User })
  @ApiNotFoundResponse({
    description: 'User with the provided username not found.',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'username', type: String })
  @UseGuards(JwtGuard)
  @Get('profile/:username')
  async getProfile(@Param('username') username: string) {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    // return {
    //   email: user.email,
    //   username: user.username,
    // };
    return user;
  }

  @ApiOperation({
    summary: 'Get username and creation date for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Username and creation date returned.',
    type: UserDateInfoDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('dateInfo')
  async getDateInfo(@UserFromRequest() userFromToken: AccessTokenPayload) {
    const user = await this.userService.findOne(userFromToken.sub);
    return {
      username: user.username,
      createdAt: user.createdAt,
    };
  }
}
