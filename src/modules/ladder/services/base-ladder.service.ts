import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from '../../tournament/entities/tournament.entity';
import { GameService } from '../../game/game.service';
import { LadderElement } from '../ladder.types';

/**
 * Base service class with shared functionality for all ladder implementations.
 * Contains common methods for tournament retrieval, game reset, and ladder traversal.
 */
@Injectable()
export class BaseLadderService {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(Tournament)
    protected readonly tournamentRepository: Repository<Tournament>,
    protected readonly gameService: GameService,
  ) {}

  /**
   * Finds a tournament with all necessary relations for ladder operations
   */
  async findTournamentForLadder(tournamentId: number): Promise<Tournament> {
    const tournament = await this.tournamentRepository.findOne({
      where: { id: tournamentId },
      relations: { games: { teamStatuses: true, teams: true }, teams: true },
    });

    if (!tournament) {
      throw new NotFoundException(
        `Tournament with ID ${tournamentId} not found`,
      );
    }

    return tournament;
  }

  /**
   * Resets (deletes) all games for a tournament
   */
  async resetGames(tournamentId: number): Promise<void> {
    this.logger.log(`Resetting games for tournament ${tournamentId}`);
    const tournament = await this.findTournamentForLadder(tournamentId);

    if (!tournament.games || tournament.games.length === 0) {
      this.logger.warn(`No games to reset for tournament ${tournamentId}`);
      return;
    }

    try {
      await Promise.all(
        tournament.games.map((game) => this.gameService.remove(game.id)),
      );
      this.logger.log(`Successfully reset ${tournament.games.length} games`);
    } catch (error) {
      this.logger.error(`Failed to reset games: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to reset tournament games');
    }
  }

  /**
   * Collects all ladder elements recursively from the tree structure
   */
  protected collectAllRounds(
    ladders: LadderElement | LadderElement[],
  ): LadderElement[] {
    ladders = Array.isArray(ladders) ? ladders : [ladders];
    const ladderElements: LadderElement[] = [];

    for (const ladder of ladders) {
      if (ladder.childrens) {
        const childElements = this.collectAllRounds(ladder.childrens);
        ladderElements.push(...childElements);
      }

      ladderElements.push(ladder);
    }

    return ladderElements;
  }

  /**
   * Collects all ladder elements from a specific round number
   */
  protected collectAllchildrensOfRound(
    numOfRound: number,
    ladders: LadderElement | LadderElement[],
  ): LadderElement[] {
    ladders = Array.isArray(ladders) ? ladders : [ladders];
    const ladderElements: LadderElement[] = [];

    for (const ladder of ladders) {
      if (ladder.roundNumber !== numOfRound && ladder.childrens) {
        const elements = this.collectAllchildrensOfRound(
          numOfRound,
          ladder.childrens,
        );
        ladderElements.push(...elements);
      } else if (ladder.roundNumber === numOfRound) {
        ladderElements.push(ladder);
      }
    }

    return ladderElements;
  }
}
