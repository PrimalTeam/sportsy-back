import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { User } from './modules/user/entities/user.entity';
import { JwtStrategy } from './modules/auth/strategies/jwt.strategy';
import { LocalStrategy } from './modules/auth/strategies/local.strategy';
import { Room } from './modules/room/entities/room.entity';
import { RoomModule } from './modules/room/room.module';
import { RoomUser } from './modules/roomUser/entities/roomUser.entity';
import { Tournament } from './modules/tournament/entities/tournament.entity';
import { GameModule } from './modules/game/game.module';
import { Game } from './modules/game/entities/game.entity';
import { Team } from './modules/team/entities/team.entity';
import { TeamUser } from './modules/teamUser/entities/teamUser.entity';
import { TeamStatus } from './modules/teamStatus/entities/teamStatus.entity';
import { TeamModule } from './modules/team/team.module';
import { TeamStatusModule } from './modules/teamStatus/teamStatus.module';
import { LadderModule } from './modules/ladder/ladder.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    RoomModule,
    AuthModule,
    GameModule,
    TeamModule,
    TeamStatusModule,
    LadderModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>('POSTGRES_HOST'),
          port: configService.get<number>('POSTGRES_PORT'),
          username: configService.get<string>('POSTGRES_USER'),
          password: configService.get<string>('POSTGRES_PASSWORD'),
          database: configService.get<string>('POSTGRES_DB'),
          entities: [
            User,
            Room,
            RoomUser,
            Tournament,
            Game,
            Team,
            TeamUser,
            TeamStatus,
          ],
          synchronize: true,
          dropSchema:
            configService.get<string>('NODE_ENV') == 'development'
              ? false
              : false,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, LocalStrategy],
})
export class AppModule {}
