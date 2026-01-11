import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ILadderService } from '../interfaces/ladder-service.interface';
import {
  Tournament,
  LeaderTypeEnum,
} from '../../tournament/entities/tournament.entity';
import { SingleEliminationService } from './LadderImplementations/single-elimination.service';
import { DoubleEliminationService } from './LadderImplementations/double-elimination.service';
import { PoolPlayService } from './LadderImplementations/pool-play.service';
import { RoundRobinService } from './LadderImplementations/round-robin.service';

/**
 * Orchestrator that picks concrete ladder implementation based on tournament type.
 */
@Injectable()
export class LadderOrchestratorService implements ILadderService {
  private readonly logger = new Logger(LadderOrchestratorService.name);

  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentRepository: Repository<Tournament>,
    private readonly single: SingleEliminationService,
    private readonly doubleElim: DoubleEliminationService,
    private readonly pool: PoolPlayService,
    private readonly roundRobin: RoundRobinService,
  ) {}

  getLadderType(tournament: Tournament): LeaderTypeEnum {
    return tournament?.leader?.type || tournament?.leaderType;
  }

  async calcLadder(tournament: Tournament): Promise<void> {
    switch (tournament.leaderType) {
      case LeaderTypeEnum.SINGLE_ELIMINATION:
        return this.single.calcLadder(tournament);
      case LeaderTypeEnum.KNOCKOUT:
      case LeaderTypeEnum.PLAYOFFS:
      case LeaderTypeEnum.DOUBLE_ELIMINATION:
        return this.doubleElim.calcLadder(tournament);
      case LeaderTypeEnum.POOL_PLAY:
        return this.pool.calcLadder(tournament);
      case LeaderTypeEnum.ROUND_ROBIN:
        return this.roundRobin.calcLadder(tournament);
      default:
        this.logger.warn(
          `Unsupported leader type: ${tournament.leaderType}, falling back to single-elimination`,
        );
        return this.single.calcLadder(tournament);
    }
  }

  async updateLadder(tournament: Tournament): Promise<unknown> {
    switch (this.getLadderType(tournament)) {
      case LeaderTypeEnum.SINGLE_ELIMINATION:
        return this.single.updateLadder(tournament);
      case LeaderTypeEnum.KNOCKOUT:
      case LeaderTypeEnum.PLAYOFFS:
      case LeaderTypeEnum.DOUBLE_ELIMINATION:
        return this.doubleElim.updateLadder(tournament);
      case LeaderTypeEnum.POOL_PLAY:
        return this.pool.updateLadder(tournament);
      case LeaderTypeEnum.ROUND_ROBIN:
        return this.roundRobin.updateLadder(tournament);
      default:
        this.logger.warn(
          `Unsupported leader type: ${tournament.leaderType}, falling back to single-elimination`,
        );
        return this.single.updateLadder(tournament);
    }
  }

  async updateLadderByTournamentId(tournamentId: number): Promise<unknown> {
    // Fetch tournament to determine correct implementation
    const tournament = await this.tournamentRepository.findOne({
      where: { id: tournamentId },
    });

    if (!tournament) {
      this.logger.warn(
        `Tournament ${tournamentId} not found, skipping ladder update`,
      );
      return undefined;
    }

    this.logger.debug(
      `Routing updateLadderByTournamentId to ${this.getLadderType(tournament)} implementation`,
    );

    switch (this.getLadderType(tournament)) {
      case LeaderTypeEnum.SINGLE_ELIMINATION:
        return this.single.updateLadderByTournamentId(tournamentId);
      case LeaderTypeEnum.KNOCKOUT:
      case LeaderTypeEnum.PLAYOFFS:
      case LeaderTypeEnum.DOUBLE_ELIMINATION:
        return this.doubleElim.updateLadderByTournamentId(tournamentId);
      case LeaderTypeEnum.POOL_PLAY:
        return this.pool.updateLadderByTournamentId(tournamentId);
      case LeaderTypeEnum.ROUND_ROBIN:
        return this.roundRobin.updateLadderByTournamentId(tournamentId);
      default:
        this.logger.warn(
          `Unsupported leader type: ${this.getLadderType(tournament)}, falling back to single-elimination`,
        );
        return this.single.updateLadderByTournamentId(tournamentId);
    }
  }

  async resetGames(tournamentId: number): Promise<void> {
    // Fetch tournament to determine correct implementation
    const tournament = await this.tournamentRepository.findOne({
      where: { id: tournamentId },
    });

    if (!tournament) {
      this.logger.warn(
        `Tournament ${tournamentId} not found, skipping reset games`,
      );
      return;
    }

    this.logger.debug(
      `Routing resetGames to ${tournament.leaderType} implementation`,
    );

    switch (tournament.leaderType) {
      case LeaderTypeEnum.SINGLE_ELIMINATION:
        return this.single.resetGames(tournamentId);
      case LeaderTypeEnum.KNOCKOUT:
      case LeaderTypeEnum.PLAYOFFS:
      case LeaderTypeEnum.DOUBLE_ELIMINATION:
        return this.doubleElim.resetGames(tournamentId);
      case LeaderTypeEnum.POOL_PLAY:
        return this.pool.resetGames(tournamentId);
      case LeaderTypeEnum.ROUND_ROBIN:
        return this.roundRobin.resetGames(tournamentId);
      default:
        this.logger.warn(
          `Unsupported leader type: ${tournament.leaderType}, falling back to single-elimination`,
        );
        return this.single.resetGames(tournamentId);
    }
  }

  async deleteLadder(
    tournamentId: number,
    resetGames?: boolean,
  ): Promise<void> {
    // Fetch tournament to determine correct implementation
    const tournament = await this.tournamentRepository.findOne({
      where: { id: tournamentId },
    });

    if (!tournament) {
      this.logger.warn(
        `Tournament ${tournamentId} not found, skipping delete ladder`,
      );
      return;
    }

    this.logger.debug(
      `Routing deleteLadder to ${tournament.leaderType} implementation`,
    );

    switch (tournament.leaderType) {
      case LeaderTypeEnum.SINGLE_ELIMINATION:
        return this.single.deleteLadder(tournamentId, resetGames);
      case LeaderTypeEnum.KNOCKOUT:
      case LeaderTypeEnum.PLAYOFFS:
      case LeaderTypeEnum.DOUBLE_ELIMINATION:
        return this.doubleElim.deleteLadder(tournamentId, resetGames);
      case LeaderTypeEnum.POOL_PLAY:
        return this.pool.deleteLadder(tournamentId, resetGames);
      case LeaderTypeEnum.ROUND_ROBIN:
        return this.roundRobin.deleteLadder(tournamentId, resetGames);
      default:
        this.logger.warn(
          `Unsupported leader type: ${tournament.leaderType}, falling back to single-elimination`,
        );
        return this.single.deleteLadder(tournamentId, resetGames);
    }
  }
}
