import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProvidersNames } from '../custom-providers';

@Module({
  imports: [UserModule, JwtModule.register({})],
  providers: [
    AuthService,
    {
      provide: ProvidersNames.ACCESS_TOKEN_SERVICE,
      useFactory: (jwtService: JwtService, configService: ConfigService) =>
        new JwtService({
          secret: configService.get<string>('ACCESS_JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('ACCESS_JWT_EXPIRATION'),
          },
        }),
      inject: [JwtService, ConfigService],
    },
    {
      provide: ProvidersNames.REFRESH_TOKEN_SERVICE,
      useFactory: (jwtService: JwtService, configService: ConfigService) =>
        new JwtService({
          secret: configService.get<string>('REFRESH_JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('REFRESH_JWT_EXPIRATION'),
          },
        }),
      inject: [JwtService, ConfigService],
    },
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
