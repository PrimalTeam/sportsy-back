import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentService } from './tournament.service';
import { TournamentController } from './touranment.controller';
import { Tournament } from './entities/tournament.entity';
import { RoomAuthModule } from '../roomAuth/roomAuth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tournament]), RoomAuthModule],
  providers: [TournamentService],
  controllers: [TournamentController],
  exports: [TournamentService],
})
export class TouranmentModule {}
