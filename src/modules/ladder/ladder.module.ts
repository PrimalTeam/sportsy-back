import { Module } from '@nestjs/common';
import { LadderService } from './ladder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournament } from '../tournament/entities/tournament.entity';
import { RoomAuthModule } from '../roomAuth/roomAuth.module';
import { GameModule } from '../game/game.module';
import { LadderController } from './ladder.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tournament]), RoomAuthModule, GameModule],
  providers: [LadderService],
  controllers: [LadderController],
  exports: [LadderService],
})
export class LadderModule {}
