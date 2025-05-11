import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { RoomAuthModule } from '../roomAuth/roomAuth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Team]), RoomAuthModule],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
