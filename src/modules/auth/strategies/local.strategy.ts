import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from 'src/user/entities/user.entity';
import { PublicUserDto } from 'src/user/dto/publicUser.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<PublicUserDto> {
    const user = this.authService.verifyUserCredentials({ email, password });
    return user;
  }
}
