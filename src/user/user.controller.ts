import { Controller, Get, UseGuards, Request, Param, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
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
}