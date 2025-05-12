import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamStatus } from './entities/teamStatus.entity';
import { TeamStatusController } from './teamStatus.controller';
import { TeamStatusService } from './teamStatus.service';
import { GameModule } from '../game/game.module';
import { RoomAuthModule } from '../roomAuth/roomAuth.module';
import { TeamStatusSubscriber } from 'src/db/db.listeners';
import { LadderService } from '../ladder/ladder.service';
import { Tournament } from '../tournament/entities/tournament.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamStatus, Tournament]),
    GameModule,
    RoomAuthModule,
  ],
  controllers: [TeamStatusController],
  providers: [TeamStatusService, TeamStatusSubscriber, LadderService],
  exports: [TeamStatusService],
})
export class TeamStatusModule {}
