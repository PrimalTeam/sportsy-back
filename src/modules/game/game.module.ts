import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { RoomAuthModule } from '../roomAuth/roomAuth.module';
import { Tournament } from '../tournament/entities/tournament.entity';
import { TeamModule } from '../team/team.module';
import { GameSubscriber } from 'src/db/db.listeners';
import { LadderService } from '../ladder/ladder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, Tournament]),
    RoomAuthModule,
    TeamModule,
  ],
  controllers: [GameController],
  providers: [GameService, LadderService, GameSubscriber],
  exports: [GameService],
})
export class GameModule {}
