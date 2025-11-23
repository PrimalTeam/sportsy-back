import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LeaderTypeEnum,
  Tournament,
} from '../../../tournament/entities/tournament.entity';
import { Repository } from 'typeorm';
import { GameService } from '../../../game/game.service';
import { BaseLadderService } from '../base-ladder.service';
import { ILadderService } from '../../interfaces/ladder-service.interface';
import { LadderElement, TeamLadderElement } from '../../ladder.types';
import { CreateGameDto } from '../../../game/dto/create-game.dto';
import { GameStatusEnum } from '../../../game/entities/game.entity';
import { WinnerDeterminationService } from '../winner-determination.service';
import { LadderUtilsService } from '../ladder-utils.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Double Elimination Ladder Service
 *
 * Double elimination tournaments have two brackets:
 * - Winners bracket: Teams that haven't lost yet
 * - Losers bracket: Teams that lost once (get a second chance)
 * - Grand Finals: Winner of each bracket face off
 *
 * A team is eliminated only after losing twice.
 */
@Injectable()
export class DoubleEliminationService
  extends BaseLadderService
  implements ILadderService
{
  constructor(
    @InjectRepository(Tournament)
    tournamentRepository: Repository<Tournament>,
    gameService: GameService,
    private readonly winnerService: WinnerDeterminationService,
    private readonly utilsService: LadderUtilsService,
  ) {
    super(tournamentRepository, gameService);
  }

  async calcLadder(tournament: Tournament): Promise<void> {
    this.logger.log(
      `Calculating double elimination ladder for tournament ${tournament.id}`,
    );

    const tournamentWithRelations = await this.findTournamentForLadder(
      tournament.id,
    );

    if (
      !tournamentWithRelations.teams ||
      tournamentWithRelations.teams.length < 2
    ) {
      throw new BadRequestException('Tournament must have at least 2 teams');
    }

    const ladder = await this.generateDoubleEliminationLadder(
      tournamentWithRelations,
    );

    const tournamentToUpdate = await this.tournamentRepository.findOne({
      where: { id: tournament.id },
    });

    if (tournamentToUpdate) {
      tournamentToUpdate.leader = ladder;
      await this.tournamentRepository.save(tournamentToUpdate);
    }

    this.logger.log(
      `Double elimination ladder generated successfully for tournament ${tournament.id}`,
    );
  }

  async updateLadderByTournamentId(tournamentId: number): Promise<unknown> {
    this.logger.log(`Updating ladder for tournament ${tournamentId}`);
    const tournament = await this.findTournamentForLadder(tournamentId);

    const ladder = tournament.leader;

    if (!ladder || !ladder.winnersBracket) {
      this.logger.warn(`No ladder found for tournament ${tournamentId}`);
      return undefined;
    }

    const updatedLadder = await this.updateDoubleEliminationLadder(
      tournament,
      ladder,
    );

    const tournamentToUpdate = await this.tournamentRepository.findOne({
      where: { id: tournamentId },
    });

    if (tournamentToUpdate) {
      tournamentToUpdate.leader = updatedLadder;
      await this.tournamentRepository.save(tournamentToUpdate);
    }

    this.logger.log(
      `Ladder updated successfully for tournament ${tournamentId}`,
    );
    return updatedLadder;
  }

  async updateLadder(tournament: Tournament): Promise<unknown> {
    this.logger.log(`Updating ladder for tournament ${tournament.id}`);
    const tournamentWithRelations = await this.findTournamentForLadder(
      tournament.id,
    );

    const ladder = tournament.leader;

    if (!ladder || !ladder.winnersBracket) {
      this.logger.warn(`No ladder to update for tournament ${tournament.id}`);
      return undefined;
    }

    const updatedLadder = await this.updateDoubleEliminationLadder(
      tournamentWithRelations,
      ladder,
    );

    const tournamentToUpdate = await this.tournamentRepository.findOne({
      where: { id: tournament.id },
    });

    if (tournamentToUpdate) {
      tournamentToUpdate.leader = updatedLadder;
      await this.tournamentRepository.save(tournamentToUpdate);
    }

    this.logger.log(
      `Ladder updated successfully for tournament ${tournament.id}`,
    );
    return updatedLadder;
  }

  /**
   * Generate the initial double elimination bracket
   */
  private async generateDoubleEliminationLadder(tournament: Tournament) {
    const ladder: {
      type: string;
      winnersBracket: LadderElement | null;
      losersBracket: LadderElement | null;
      grandFinal: LadderElement | null;
    } = {
      type: LeaderTypeEnum.DOUBLE_ELIMINATION,
      winnersBracket: null,
      losersBracket: null,
      grandFinal: null,
    };

    let teams = [...tournament.teams];
    const numOfRounds = this.utilsService.calculateRounds(teams.length);

    teams = this.utilsService.shuffleArray(teams);

    this.logger.debug(
      `Tournament has ${teams.length} teams, ${numOfRounds} rounds`,
    );

    // Build empty winners bracket (same as single elimination)
    ladder.winnersBracket = this.buildEmptyBracket(
      numOfRounds - 1,
      numOfRounds - 1,
      'Winners',
    );

    // Build empty losers bracket (one less round)
    ladder.losersBracket = this.buildEmptyBracket(
      numOfRounds - 2,
      numOfRounds - 2,
      'Losers',
    );

    // Create first round games in winners bracket
    const teamPairs = this.utilsService.chunkIntoPairs(teams);
    const games = [];

    for (const [firstTeam, secondTeam] of teamPairs) {
      const createGame: CreateGameDto = {
        teamIds: [firstTeam.id, secondTeam.id],
        status: GameStatusEnum.PENDING,
      };
      const game = await this.gameService.addGame(createGame, tournament.id);
      games.push(game);
    }

    // Assign games to first round
    const firstRoundElements = this.collectAllchildrensOfRound(
      0,
      ladder.winnersBracket,
    );
    firstRoundElements.forEach((element, index) => {
      const game = games[index];
      if (game) {
        element.teams = TeamLadderElement.createFromGame(game, game.teams);
        element.teamIds = game.teamIds;
        element.gameId = game.id;
        element.status = game.status;
      }
    });

    this.logger.log(
      `Generated double elimination ladder with ${games.length} initial games`,
    );
    return ladder;
  }

  /**
   * Update ladder based on game results
   */
  private async updateDoubleEliminationLadder(
    tournament: Tournament,
    ladder: {
      winnersBracket: LadderElement;
      losersBracket: LadderElement;
      grandFinal: LadderElement | null;
    },
  ) {
    // Update games in both brackets
    this.updateBracketGames(tournament, ladder.winnersBracket);
    this.updateBracketGames(tournament, ladder.losersBracket);
    if (ladder.grandFinal) {
      this.updateBracketGames(tournament, ladder.grandFinal);
    }

    if (tournament.internalConfig?.autogenerateGamesFromLadder) {
      // Create next round games in winners bracket
      await this.createNextRoundGames(
        tournament,
        ladder.winnersBracket,
        'Winners',
      );

      // Create next round games in losers bracket
      await this.createNextRoundGames(
        tournament,
        ladder.losersBracket,
        'Losers',
      );

      // Check if we need to create grand final
      await this.createGrandFinalIfReady(tournament, ladder);
    }

    return ladder;
  }

  /**
   * Build an empty bracket structure
   */
  private buildEmptyBracket(
    roundNum: number,
    maxRound: number,
    bracketName: string,
  ): LadderElement {
    const element: LadderElement = {
      name: `${bracketName} ${this.utilsService.getRoundName(roundNum, maxRound)}`,
      teamIds: [],
      teams: [],
      id: uuidv4(),
      status: null,
      childrens: null,
      gameId: null,
      roundNumber: roundNum,
    };

    if (roundNum > 0) {
      element.childrens = [
        this.buildEmptyBracket(roundNum - 1, maxRound, bracketName),
        this.buildEmptyBracket(roundNum - 1, maxRound, bracketName),
      ];
    }

    return element;
  }

  /**
   * Update all games in a bracket with current data
   */
  private updateBracketGames(
    tournament: Tournament,
    bracket: LadderElement,
  ): void {
    const elements = this.collectAllRounds(bracket);

    elements.forEach((element) => {
      const game = tournament.games.find((g) => g.id === element.gameId);
      if (game) {
        const gameTeams = tournament.teams.filter((team) =>
          game.teamIds.includes(team.id),
        );
        element.gameId = game.id;
        element.teamIds = game.teamIds;
        element.status = game.status;
        element.teams = TeamLadderElement.createFromGame(game, gameTeams);
      } else if (element.gameId) {
        // Game was deleted, clear the element
        this.logger.warn(
          `Game ${element.gameId} not found for element ${element.id}, clearing`,
        );
        element.gameId = null;
        element.teamIds = null;
        element.status = null;
        element.teams = [];
      }
    });
  }

  /**
   * Create next round games in a bracket
   */
  private async createNextRoundGames(
    tournament: Tournament,
    bracket: LadderElement,
    bracketName: string,
  ): Promise<void> {
    const elementsCanBeCreated = this.findElementsReadyForGames([bracket]);

    this.logger.debug(
      `Found ${elementsCanBeCreated.length} ${bracketName} elements ready for games`,
    );

    for (const element of elementsCanBeCreated) {
      if (!element.childrens || element.childrens.length < 2) continue;

      const firstGame = tournament.games.find(
        (game) => game.id === element.childrens[0].gameId,
      );
      const secondGame = tournament.games.find(
        (game) => game.id === element.childrens[1].gameId,
      );

      if (!firstGame || !secondGame) {
        this.logger.warn(
          `Missing game(s) for ${bracketName} element ${element.id}, skipping`,
        );
        continue;
      }

      const firstTeam = this.winnerService.getWinner(
        tournament.teams.filter((team) =>
          element.childrens[0].teamIds.includes(team.id),
        ),
        firstGame,
      );

      const secondTeam = this.winnerService.getWinner(
        tournament.teams.filter((team) =>
          element.childrens[1].teamIds.includes(team.id),
        ),
        secondGame,
      );

      if (firstTeam && secondTeam) {
        const createGame: CreateGameDto = {
          teamIds: [firstTeam.id, secondTeam.id],
          status: GameStatusEnum.PENDING,
        };
        const game = await this.gameService.addGame(createGame, tournament.id);

        element.gameId = game.id;
        element.teamIds = game.teamIds;
        element.status = game.status;
        element.teams = TeamLadderElement.createFromGame(game, game.teams);
      }
    }
  }

  /**
   * Create grand final if both brackets are complete
   */
  private async createGrandFinalIfReady(
    tournament: Tournament,
    ladder: {
      winnersBracket: LadderElement;
      losersBracket: LadderElement;
      grandFinal: LadderElement | null;
    },
  ): Promise<void> {
    if (ladder.grandFinal?.gameId) return; // Already created

    const winnersGame = tournament.games.find(
      (game) => game.id === ladder.winnersBracket.gameId,
    );
    const losersGame = tournament.games.find(
      (game) => game.id === ladder.losersBracket.gameId,
    );

    const winnersChampion =
      ladder.winnersBracket.status === GameStatusEnum.COMPLETED && winnersGame
        ? this.winnerService.getWinner(
            tournament.teams.filter((team) =>
              ladder.winnersBracket.teamIds.includes(team.id),
            ),
            winnersGame,
          )
        : null;

    const losersChampion =
      ladder.losersBracket.status === GameStatusEnum.COMPLETED && losersGame
        ? this.winnerService.getWinner(
            tournament.teams.filter((team) =>
              ladder.losersBracket.teamIds.includes(team.id),
            ),
            losersGame,
          )
        : null;

    if (winnersChampion && losersChampion) {
      this.logger.log('Creating grand final');

      const createGame: CreateGameDto = {
        teamIds: [winnersChampion.id, losersChampion.id],
        status: GameStatusEnum.PENDING,
      };
      const game = await this.gameService.addGame(createGame, tournament.id);

      ladder.grandFinal = {
        name: 'Grand Final',
        roundNumber: 999,
        teamIds: game.teamIds,
        teams: TeamLadderElement.createFromGame(game, game.teams),
        id: uuidv4(),
        gameId: game.id,
        status: game.status,
        childrens: null,
      };
    }
  }

  /**
   * Find elements ready for game creation
   */
  private findElementsReadyForGames(
    elements: LadderElement[],
  ): LadderElement[] {
    const ready: LadderElement[] = [];

    for (const element of elements) {
      if (element.childrens && element.gameId === null) {
        const completedChildren = element.childrens.filter(
          (child) =>
            child.gameId !== null && child.status === GameStatusEnum.COMPLETED,
        );

        if (completedChildren.length >= 2) {
          ready.push(element);
        } else {
          ready.push(...this.findElementsReadyForGames(element.childrens));
        }
      }
    }

    return ready;
  }
}
