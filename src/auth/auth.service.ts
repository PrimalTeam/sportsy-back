import {
  Injectable,
  BadRequestException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/loginAuth.dto';
import { RegisterAuthDto } from './dto/registerAuth.dto';
import { PublicUserDto } from 'src/user/dto/publicUser.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
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
    const payload = { email: publicUser.email, sub: publicUser.id };
    return this.jwtService.sign(payload);
  }

  //Restructure method
  async validateUserCredentials(
    credentials: LoginAuthDto,
  ): Promise<PublicUserDto> {
    const { email, password } = credentials;
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
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
