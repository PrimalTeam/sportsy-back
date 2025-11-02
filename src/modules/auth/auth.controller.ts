import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/registerAuth.dto';
import { LoginAuthDto } from './dto/loginAuth.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserFromRequest } from 'src/decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthTokensDto } from './dto/authTokens.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user account.' })
  @ApiCreatedResponse({ description: 'User registered successfully.' })
  @ApiBody({ type: RegisterAuthDto })
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Log in with user credentials.' })
  @ApiBody({ type: LoginAuthDto })
  @ApiOkResponse({
    description: 'Access and refresh tokens issued.',
    type: AuthTokensDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @Post('login')
  async login(@UserFromRequest() user: User, @Body() _loginDto: LoginAuthDto) {
    return this.authService.generateLoginResponse(user);
  }

  @ApiOperation({
    summary: 'Refresh expired access token using refresh token.',
  })
  @ApiParam({
    name: 'refreshToken',
    description: 'Refresh token issued during login.',
  })
  @ApiOkResponse({
    description: 'New access and refresh tokens issued.',
    type: AuthTokensDto,
  })
  @Post('refresh/:refreshToken')
  async refresh(@Param('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
