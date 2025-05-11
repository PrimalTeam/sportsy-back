import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamStatus } from './entities/teamStatus.entity';
import { TeamStatusController } from './teamStatus.controller';
import { TeamStatusService } from './teamStatus.service';
import { GameModule } from '../game/game.module';
import { RoomAuthModule } from '../roomAuth/roomAuth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TeamStatus]), GameModule, RoomAuthModule],
  controllers: [TeamStatusController],
  providers: [TeamStatusService],
  exports: [TeamStatusService],
})
export class TeamStatusModule {}
