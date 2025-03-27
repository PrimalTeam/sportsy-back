import {
  Controller,
  Get,
  UseGuards,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/guards/auth.guard';
import { UserFromRequest } from 'src/decorators/user.decorator';
import { AccessTokenPayload } from 'src/auth/models/accessToken';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('profile/:username')
  async getProfile(@Param('username') username: string) {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return {
      email: user.email,
      username: user.username,
    };
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
