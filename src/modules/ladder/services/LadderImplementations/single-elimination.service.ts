import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LeaderTypeEnum,
  Tournament,
} from '../../../tournament/entities/tournament.entity';
import { Repository } from 'typeorm';
import { CreateGameDto } from '../../../game/dto/create-game.dto';
import { Game, GameStatusEnum } from '../../../game/entities/game.entity';
import { GameService } from '../../../game/game.service';
import { v4 as uuidv4 } from 'uuid';
import { WinnerDeterminationService } from '../winner-determination.service';
import { LadderUtilsService } from '../ladder-utils.service';
import { BaseLadderService } from '../base-ladder.service';
import { ILadderService } from '../../interfaces/ladder-service.interface';
import { LadderElement, TeamLadderElement } from '../../ladder.types';

@Injectable()
export class SingleEliminationService
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
    this.logger.log(`Calculating ladder for tournament ${tournament.id}`);

    const tournamentWithRelations = await this.findTournamentForLadder(
      tournament.id,
    );

    if (
      !tournamentWithRelations.teams ||
      tournamentWithRelations.teams.length < 2
    ) {
      throw new BadRequestException('Tournament must have at least 2 teams');
    }

    switch (tournament.leaderType) {
      case LeaderTypeEnum.SINGLE_ELIMINATION: {
        const ladder = await this.generateSingleEliminationLadder(
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
          `Ladder generated successfully for tournament ${tournament.id}`,
        );
        break;
      }
      case LeaderTypeEnum.POOL_PLAY:
        throw new BadRequestException(
          'Pool play ladder type not yet implemented',
        );
      default:
        throw new BadRequestException(
          `Unsupported ladder type: ${tournament.leaderType}`,
        );
    }
  }

  async updateLadderByTournamentId(
    tournamentId: number,
  ): Promise<
    { mainLadder: LadderElement; preGames: LadderElement[] } | undefined
  > {
    this.logger.log(`Updating ladder for tournament ${tournamentId}`);
    const tournament = await this.findTournamentForLadder(tournamentId);

    switch (tournament.leaderType) {
      case LeaderTypeEnum.SINGLE_ELIMINATION: {
        const ladder = tournament.leader;

        if (!ladder || !ladder.mainLadder) {
          this.logger.warn(`No ladder found for tournament ${tournamentId}`);
          return undefined;
        }

        const updatedLadder = await this.updateSingleEliminationLadder(
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
      case LeaderTypeEnum.POOL_PLAY:
        throw new BadRequestException(
          'Pool play ladder type not yet implemented',
        );
      default:
        throw new BadRequestException(
          `Unsupported ladder type: ${tournament.leaderType}`,
        );
    }
  }

  async updateLadder(
    tournament: Tournament,
  ): Promise<
    { mainLadder: LadderElement; preGames: LadderElement[] } | undefined
  > {
    this.logger.log(`Updating ladder for tournament ${tournament.id}`);
    const tournamentWithRelations = await this.findTournamentForLadder(
      tournament.id,
    );

    switch (tournament.leaderType) {
      case LeaderTypeEnum.SINGLE_ELIMINATION: {
        const ladder = tournament.leader;

        if (!ladder || !ladder.mainLadder) {
          this.logger.warn(
            `No ladder to update for tournament ${tournament.id}`,
          );
          return undefined;
        }

        const updatedLadder = await this.updateSingleEliminationLadder(
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
      case LeaderTypeEnum.POOL_PLAY:
        throw new BadRequestException(
          'Pool play ladder type not yet implemented',
        );
      default:
        throw new BadRequestException(
          `Unsupported ladder type: ${tournament.leaderType}`,
        );
    }
  }

  /**
   * Builds an empty single elimination bracket structure recursively
   */
  buildEmptySingleEliminationLadder(
    roundNum: number,
    maxRound: number,
  ): LadderElement {
    const ladder: LadderElement = {
      name: this.utilsService.getRoundName(roundNum, maxRound),
      teamIds: [],
      teams: [],
      id: uuidv4(),
      status: null,
      childrens: null,
      gameId: null,
      roundNumber: roundNum,
    };

    if (roundNum > 0) {
      ladder.childrens = [
        this.buildEmptySingleEliminationLadder(roundNum - 1, maxRound),
        this.buildEmptySingleEliminationLadder(roundNum - 1, maxRound),
      ];
    }

    return ladder;
  }

  /**
   * Generates a single elimination ladder for a tournament
   */
  async generateSingleEliminationLadder(tournament: Tournament) {
    this.logger.log(
      `Generating single elimination ladder for tournament ${tournament.id}`,
    );

    const ladder: {
      type: LeaderTypeEnum;
      mainLadder: LadderElement | null;
      preGames: LadderElement[];
    } = {
      type: LeaderTypeEnum.SINGLE_ELIMINATION,
      mainLadder: null,
      preGames: [],
    };

    const games: Game[] = [];
    let teams = [...tournament.teams]; // copy
    const numOfRounds = this.utilsService.calculateRounds(teams.length);
    const byes = this.utilsService.calculateByes(teams.length);

    teams = this.utilsService.shuffleArray(teams);

    this.logger.debug(
      `Tournament has ${teams.length} teams, ${numOfRounds} rounds, ${byes} byes`,
    );

    if (byes > 0) {
      ladder.mainLadder = this.buildEmptySingleEliminationLadder(
        numOfRounds - 2,
        numOfRounds - 2,
      );

      const playTeams = teams.slice(byes - 1, teams.length - 1);

      this.logger.debug(`Creating ${playTeams.length / 2} preliminary games`);

      const teamPairs = this.utilsService.chunkIntoPairs(playTeams);
      for (const [firstTeam, secondTeam] of teamPairs) {
        const createGame: CreateGameDto = {
          teamIds: [firstTeam.id, secondTeam.id],
          status: GameStatusEnum.PENDING,
        };
        const game = await this.gameService.addGame(createGame, tournament.id);
        games.push(game);
      }

      games.forEach((game) =>
        ladder.preGames.push({
          name: 'PreGame',
          roundNumber: 0,
          teamIds: game.teamIds,
          teams: TeamLadderElement.createFromGame(game, game.teams),
          status: game.status,
          gameId: game.id,
          childrens: null,
          id: uuidv4(),
        }),
      );
    } else {
      ladder.mainLadder = this.buildEmptySingleEliminationLadder(
        numOfRounds - 1,
        numOfRounds - 1,
      );

      this.logger.debug(`Creating ${teams.length / 2} first round games`);

      const teamPairs = this.utilsService.chunkIntoPairs(teams);
      for (const [firstTeam, secondTeam] of teamPairs) {
        const createGame: CreateGameDto = {
          teamIds: [firstTeam.id, secondTeam.id],
          status: GameStatusEnum.PENDING,
        };
        const game = await this.gameService.addGame(createGame, tournament.id);
        games.push(game);
      }

      const elements = this.collectAllchildrensOfRound(0, ladder.mainLadder);
      elements.forEach((element, index) => {
        const game = games[index];
        if (game) {
          element.teams = TeamLadderElement.createFromGame(game, game.teams);
          element.teamIds = game.teamIds;
          element.gameId = game.id;
        }
      });
    }

    this.logger.log(
      `Successfully generated ladder with ${games.length} initial games`,
    );
    return ladder;
  }

  /**
   * Updates a single elimination ladder based on game results
   */
  async updateSingleEliminationLadder(
    tournament: Tournament,
    ladder: { mainLadder: LadderElement; preGames: LadderElement[] },
  ) {
    this.logger.log(
      `Updating single elimination ladder for tournament ${tournament.id}`,
    );

    this.updateSingleEliminationLadderGames(tournament, ladder.mainLadder);

    ladder.preGames.forEach((element) => {
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
          `PreGame ${element.gameId} not found, clearing element ${element.id}`,
        );
        element.gameId = null;
        element.teamIds = null;
        element.status = null;
        element.teams = [];
      }
    });

    this.logger.debug('Ladder games updated with current results');

    if (tournament.internalConfig?.autogenerateGamesFromLadder) {
      const elementsCanBeCreated = this.findLadderElementsThatCanBeCreated([
        ladder.mainLadder,
      ]);

      this.logger.debug(
        `Found ${elementsCanBeCreated.length} elements ready for next round`,
      );

      const promises = elementsCanBeCreated.map(async (element) => {
        if (!element.childrens || element.childrens.length < 2) {
          this.logger.warn(
            'Element missing required children for game creation',
          );
          return;
        }

        const firstGame = tournament.games.find(
          (game) => game.id === element.childrens[0].gameId,
        );
        const secondGame = tournament.games.find(
          (game) => game.id === element.childrens[1].gameId,
        );

        if (!firstGame || !secondGame) {
          this.logger.warn(
            `Game(s) not found for ladder element ${element.id}, skipping`,
          );
          return;
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

        const createGame: CreateGameDto = {
          teamIds: [firstTeam.id, secondTeam.id],
          status: GameStatusEnum.PENDING,
        };
        const game = await this.gameService.addGame(createGame, tournament.id);

        element.gameId = game.id;
        element.teamIds = game.teamIds;
        element.status = game.status;
        element.teams = TeamLadderElement.createFromGame(game, game.teams);
      });
      await Promise.all(promises);

      const completedPreGames = ladder.preGames.filter(
        (preGame) => preGame.status === GameStatusEnum.COMPLETED,
      );

      const firstRoundElements = this.collectAllchildrensOfRound(
        0,
        ladder.mainLadder,
      );
      const allPreGamesComplete =
        completedPreGames.length === ladder.preGames.length;
      const firstRoundNeedsSetup = firstRoundElements[0]?.gameId === null;

      if (allPreGamesComplete && firstRoundNeedsSetup) {
        this.logger.debug(
          'All preliminary games complete, setting up first round',
        );

        const preGamesLosers = ladder.preGames
          .map((preGame) => {
            const game = tournament.games.find((g) => g.id === preGame.gameId);
            if (!game) {
              this.logger.warn(
                `PreGame ${preGame.id} references missing game ${preGame.gameId}`,
              );
              return null;
            }
            return this.winnerService.getLoser(
              tournament.teams.filter((team) =>
                preGame.teamIds.includes(team.id),
              ),
              game,
            );
          })
          .filter((loser) => loser !== null);

        let remainingTeams = tournament.teams.filter(
          (team) => !preGamesLosers.map((loser) => loser.id).includes(team.id),
        );

        const games: Game[] = [];
        // const numOfRounds = this.utilsService.calculateRounds(
        //   remainingTeams.length,
        // );
        remainingTeams = this.utilsService.shuffleArray(remainingTeams);

        const teamPairs = this.utilsService.chunkIntoPairs(remainingTeams);
        for (const [firstTeam, secondTeam] of teamPairs) {
          const createGame: CreateGameDto = {
            teamIds: [firstTeam.id, secondTeam.id],
            status: GameStatusEnum.PENDING,
          };
          const game = await this.gameService.addGame(
            createGame,
            tournament.id,
          );
          games.push(game);
        }

        const elements = this.collectAllchildrensOfRound(0, ladder.mainLadder);
        elements.forEach((element, index) => {
          const game = games[index];
          if (game) {
            element.teams = TeamLadderElement.createFromGame(game, game.teams);
            element.teamIds = game.teamIds;
            element.gameId = game.id;
          }
        });

        this.logger.log(`Created ${games.length} first round games`);
      }
    }

    return ladder;
  }

  /**
   * Finds ladder elements that are ready to have games created
   */
  findLadderElementsThatCanBeCreated(
    ladders: LadderElement[],
  ): LadderElement[] {
    const ladderElements: LadderElement[] = [];
    for (let index = 0; index < ladders.length; index++) {
      const ladder = ladders[index];

      if (ladder.childrens && ladder.gameId === null) {
        const completedChildren = ladder.childrens.filter(
          (element) =>
            element.gameId !== null &&
            element.status === GameStatusEnum.COMPLETED,
        );

        if (completedChildren.length >= 2) {
          ladderElements.push(ladder);
        } else {
          const nestedElements = this.findLadderElementsThatCanBeCreated(
            ladder.childrens,
          );
          ladderElements.push(...nestedElements);
        }
      }
    }

    return ladderElements;
  }

  /**
   * Updates all games in a ladder element tree with current game data
   */
  updateSingleEliminationLadderGames(
    tournament: Tournament,
    ladder: LadderElement,
  ): void {
    const elements = this.collectAllRounds(ladder);

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
}
