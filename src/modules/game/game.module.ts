import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { RoomAuthModule } from '../roomAuth/roomAuth.module';
import { Tournament } from '../tournament/entities/tournament.entity';
import { TeamModule } from '../team/team.module';
import { GameSubscriber } from 'src/db/db.listeners';
import { LadderModule } from '../ladder/ladder.module';
import { GameGateway } from './game.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, Tournament]),
    RoomAuthModule,
    AuthModule,
    TeamModule,
    forwardRef(() => LadderModule),
  ],
  controllers: [GameController],
  providers: [GameService, GameSubscriber, GameGateway],
  exports: [GameService],
})
export class GameModule {}
