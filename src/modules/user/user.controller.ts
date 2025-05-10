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

@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('rooms')
  async getRooms(@UserFromRequest() userFromToken: AccessTokenPayload) {
    return this.userService.getUserRooms(userFromToken.sub);
  }

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
