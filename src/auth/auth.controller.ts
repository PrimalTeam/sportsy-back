import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/registerAuth.dto';
import { LoginAuthDto } from './dto/loginAuth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.CREATED) 
  @Post('login')
  async login(@Body() loginDto: LoginAuthDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  async logout() {
    return this.authService.logout();
  }
}