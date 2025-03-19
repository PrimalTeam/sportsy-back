import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service'; 
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/loginAuth.dto';
import { RegisterAuthDto } from './dto/registerAuth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterAuthDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('E-mail already taken');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser = await this.usersService.create({
      username: registerDto.username,
      passwordHash: hashedPassword,
      email: registerDto.email,
    });

    return {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      success: 'true',
    };
  }

  async login(loginDto: LoginAuthDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.sign(payload);
    return {
      access_token: accessToken 
    };
  }

  async logout() {
    return { success: true, message: 'Logout successful' };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user; 
      return result;
    }
    return null;
  }
}