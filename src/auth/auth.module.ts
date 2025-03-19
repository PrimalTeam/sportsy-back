
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule.forRoot({
      load: [jwtConfig],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { expiresIn: '72h' },
      }),
      inject: [ConfigService],
    }),
  
  ],
  providers: [AuthService,JwtStrategy],
  controllers: [AuthController],
  //exports: [AuthService],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}
