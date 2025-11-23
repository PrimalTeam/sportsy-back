import { Module, forwardRef } from '@nestjs/common';
import { LadderOrchestratorService } from './services/ladder-orchestrator.service';
import { SingleEliminationService } from './services/LadderImplementations/single-elimination.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournament } from '../tournament/entities/tournament.entity';
import { RoomAuthModule } from '../roomAuth/roomAuth.module';
import { GameModule } from '../game/game.module';
import { LadderController } from './ladder.controller';
import { WinnerDeterminationService } from './services/winner-determination.service';
import { LadderUtilsService } from './services/ladder-utils.service';
import { BaseLadderService } from './services/base-ladder.service';
import { DoubleEliminationService } from './services/LadderImplementations/double-elimination.service';
import { PoolPlayService } from './services/LadderImplementations/pool-play.service';
import { RoundRobinService } from './services/LadderImplementations/round-robin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tournament]),
    RoomAuthModule,
    forwardRef(() => GameModule),
  ],
  providers: [
    WinnerDeterminationService,
    LadderUtilsService,
    BaseLadderService,
    LadderOrchestratorService,
    // concrete implementations
    SingleEliminationService,
    DoubleEliminationService,
    PoolPlayService,
    RoundRobinService,
    { provide: 'ILadderService', useClass: LadderOrchestratorService },
  ],
  controllers: [LadderController],
  exports: ['ILadderService'],
})
export class LadderModule {}
