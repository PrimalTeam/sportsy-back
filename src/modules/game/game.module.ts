import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { RoomAuthModule } from '../roomAuth/roomAuth.module';
import { Tournament } from '../tournament/entities/tournament.entity';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, Tournament]),
    RoomAuthModule,
    TeamModule,
  ],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
