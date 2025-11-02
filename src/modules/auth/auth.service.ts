import {
  Injectable,
  BadRequestException,
  HttpStatus,
  HttpException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/loginAuth.dto';
import { RegisterAuthDto } from './dto/registerAuth.dto';
import { PublicUserDto } from '../user/dto/publicUser.dto';
import { AccessTokenPayloadCreate } from './models/accessToken';
import { RefreshTokenPayloadCreate } from './models/refreshToken';
import { AuthTokensDto } from './dto/authTokens.dto';
import { ProvidersNames } from '../custom-providers';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    @Inject(ProvidersNames.ACCESS_TOKEN_SERVICE)
    private accessJwtService: JwtService,
    @Inject(ProvidersNames.REFRESH_TOKEN_SERVICE)
    private refreshJwtService: JwtService,
  ) {}

  async register(registerDto: RegisterAuthDto) {
    if (await this.userService.validateUserExistence({ ...registerDto })) {
      throw new BadRequestException('E-mail or username is already taken.');
    }
    await this.userService.create({
      ...registerDto,
    });

    return HttpStatus.CREATED;
  }

  async generateAccessToken(publicUser: PublicUserDto): Promise<string> {
    const payload: AccessTokenPayloadCreate = {
      email: publicUser.email,
      sub: publicUser.id,
    };
    return this.accessJwtService.sign(payload);
  }

  async generateRefreshToken(publicUser: PublicUserDto): Promise<string> {
    const payload: RefreshTokenPayloadCreate = {
      email: publicUser.email,
      sub: publicUser.id,
    };
    return this.refreshJwtService.sign(payload);
  }

  async generateLoginResponse(
    publicUser: PublicUserDto,
  ): Promise<AuthTokensDto> {
    return {
      access_token: await this.generateAccessToken(publicUser),
      refresh_token: await this.generateRefreshToken(publicUser),
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokensDto> {
    const payload = this.refreshJwtService.verify(refreshToken);
    if (!payload) {
      throw new HttpException(
        'Invalid refresh token.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.userService.findByEmail(payload.email);
    if (!user) {
      throw new HttpException(
        'User with given email not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.generateLoginResponse(user);
  }

  //Restructure method
  async validateUserCredentials(
    credentials: LoginAuthDto,
  ): Promise<PublicUserDto> {
    const { email, password } = credentials;
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async verifyUserCredentials(
    credentials: LoginAuthDto,
  ): Promise<PublicUserDto> {
    const { email, password } = credentials;
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new HttpException(
        'User with given email not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new HttpException('Invalid credentials.', HttpStatus.UNAUTHORIZED);
    }

    const { password: _, ...result } = user;
    return result;
  }
}
