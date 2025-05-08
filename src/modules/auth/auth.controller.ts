import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/registerAuth.dto';
import { LoginAuthDto } from './dto/loginAuth.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserFromRequest } from 'src/decorators/user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@UserFromRequest() user: User, @Body() _loginDto: LoginAuthDto) {
    return this.authService.generateLoginResponse(user);
  }

  @Post('refresh/:refreshToken')
  async refresh(@Param('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
