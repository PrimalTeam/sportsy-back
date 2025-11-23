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
import { Team } from '../../../team/entities/team.entity';

/**
 * Pool Play Ladder Service
 *
 * Pool play tournaments divide teams into groups (pools).
 * Within each pool, teams play round-robin style.
 * Top teams from each pool advance to playoffs/finals.
 *
 * Structure:
 * - Multiple pools (groups) with teams
 * - Round-robin games within each pool
 * - Standings tracked per pool
 * - Playoff bracket for pool winners
 */
@Injectable()
export class PoolPlayService
  extends BaseLadderService
  implements ILadderService
{
  private readonly DEFAULT_POOL_SIZE = 4; // Teams per pool

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
      `Calculating pool play ladder for tournament ${tournament.id}`,
    );

    const tournamentWithRelations = await this.findTournamentForLadder(
      tournament.id,
    );

    if (
      !tournamentWithRelations.teams ||
      tournamentWithRelations.teams.length < 4
    ) {
      throw new BadRequestException('Pool play requires at least 4 teams');
    }

    const ladder = await this.generatePoolPlayLadder(tournamentWithRelations);

    const tournamentToUpdate = await this.tournamentRepository.findOne({
      where: { id: tournament.id },
    });

    if (tournamentToUpdate) {
      tournamentToUpdate.leader = ladder;
      await this.tournamentRepository.save(tournamentToUpdate);
    }

    this.logger.log(
      `Pool play ladder generated successfully for tournament ${tournament.id}`,
    );
  }

  async updateLadderByTournamentId(tournamentId: number): Promise<unknown> {
    this.logger.log(`Updating ladder for tournament ${tournamentId}`);
    const tournament = await this.findTournamentForLadder(tournamentId);

    const ladder = tournament.leader;

    if (!ladder || !ladder.pools) {
      this.logger.warn(`No ladder found for tournament ${tournamentId}`);
      return undefined;
    }

    const updatedLadder = await this.updatePoolPlayLadder(tournament, ladder);

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

    if (!ladder || !ladder.pools) {
      this.logger.warn(`No ladder to update for tournament ${tournament.id}`);
      return undefined;
    }

    const updatedLadder = await this.updatePoolPlayLadder(
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
   * Generate pool play ladder with pools and playoff bracket
   */
  private async generatePoolPlayLadder(tournament: Tournament) {
    const ladder: {
      type: string;
      pools: Array<{ name: string; teams: Team[]; games: LadderElement[] }>;
      playoffs: LadderElement | null;
      standings: Record<
        number,
        { wins: number; losses: number; points: number }
      >;
    } = {
      type: LeaderTypeEnum.POOL_PLAY,
      pools: [],
      playoffs: null,
      standings: {},
    };

    let teams = [...tournament.teams];
    teams = this.utilsService.shuffleArray(teams);

    // Divide teams into pools
    const numPools = Math.ceil(teams.length / this.DEFAULT_POOL_SIZE);
    const pools: Team[][] = [];

    for (let i = 0; i < numPools; i++) {
      pools.push([]);
    }

    // Distribute teams evenly across pools
    teams.forEach((team, index) => {
      pools[index % numPools].push(team);
      ladder.standings[team.id] = { wins: 0, losses: 0, points: 0 };
    });

    this.logger.debug(
      `Created ${numPools} pools with ${teams.length} total teams`,
    );

    // Create round-robin games for each pool
    for (let poolIndex = 0; poolIndex < pools.length; poolIndex++) {
      const poolTeams = pools[poolIndex];
      const poolGames: LadderElement[] = [];

      // Generate all possible pairings (round-robin)
      for (let i = 0; i < poolTeams.length; i++) {
        for (let j = i + 1; j < poolTeams.length; j++) {
          const createGame: CreateGameDto = {
            teamIds: [poolTeams[i].id, poolTeams[j].id],
            status: GameStatusEnum.PENDING,
          };
          const game = await this.gameService.addGame(
            createGame,
            tournament.id,
          );

          poolGames.push({
            name: `Pool ${String.fromCharCode(65 + poolIndex)} Game`,
            roundNumber: 0,
            teamIds: game.teamIds,
            teams: TeamLadderElement.createFromGame(game, [
              poolTeams[i],
              poolTeams[j],
            ]),
            id: uuidv4(),
            gameId: game.id,
            status: game.status,
            childrens: null,
          });
        }
      }

      ladder.pools.push({
        name: `Pool ${String.fromCharCode(65 + poolIndex)}`,
        teams: poolTeams,
        games: poolGames,
      });
    }

    this.logger.log(
      `Generated pool play with ${ladder.pools.length} pools and ${ladder.pools.reduce((sum, p) => sum + p.games.length, 0)} pool games`,
    );
    return ladder;
  }

  /**
   * Update pool play ladder and create playoffs if pools are complete
   */
  private async updatePoolPlayLadder(
    tournament: Tournament,
    ladder: {
      pools: Array<{ name: string; teams: Team[]; games: LadderElement[] }>;
      playoffs: LadderElement | null;
      standings: Record<
        number,
        { wins: number; losses: number; points: number }
      >;
    },
  ) {
    // Update all pool games
    for (const pool of ladder.pools) {
      for (const gameElement of pool.games) {
        const game = tournament.games.find((g) => g.id === gameElement.gameId);
        if (game) {
          const gameTeams = tournament.teams.filter((team) =>
            game.teamIds.includes(team.id),
          );
          gameElement.teamIds = game.teamIds;
          gameElement.status = game.status;
          gameElement.teams = TeamLadderElement.createFromGame(game, gameTeams);

          // Update standings if game is complete
          if (game.status === GameStatusEnum.COMPLETED) {
            const winner = this.winnerService.getWinner(gameTeams, game);
            const loser = this.winnerService.getLoser(gameTeams, game);

            if (winner && loser) {
              ladder.standings[winner.id].wins += 1;
              ladder.standings[winner.id].points += 3; // 3 points for win
              ladder.standings[loser.id].losses += 1;
            }
          }
        } else if (gameElement.gameId) {
          // Game was deleted, clear the element
          this.logger.warn(
            `Pool game ${gameElement.gameId} not found, clearing`,
          );
          gameElement.gameId = null;
          gameElement.teamIds = null;
          gameElement.status = null;
          gameElement.teams = [];
        }
      }
    }

    // Check if all pool games are complete
    const allPoolGamesComplete = ladder.pools.every((pool) =>
      pool.games.every((game) => game.status === GameStatusEnum.COMPLETED),
    );

    if (
      allPoolGamesComplete &&
      !ladder.playoffs &&
      tournament.internalConfig?.autogenerateGamesFromLadder
    ) {
      this.logger.log('All pool games complete, creating playoffs');
      await this.createPlayoffs(tournament, ladder);
    }

    return ladder;
  }

  /**
   * Create playoff bracket from pool winners
   */
  private async createPlayoffs(
    tournament: Tournament,
    ladder: {
      pools: Array<{ name: string; teams: Team[]; games: LadderElement[] }>;
      playoffs: LadderElement | null;
      standings: Record<
        number,
        { wins: number; losses: number; points: number }
      >;
    },
  ): Promise<void> {
    // Get top team from each pool
    const poolWinners: Team[] = [];

    for (const pool of ladder.pools) {
      const poolTeamIds = pool.teams.map((t) => t.id);
      const poolStandings = poolTeamIds
        .map((id) => ({
          teamId: id,
          ...ladder.standings[id],
        }))
        .sort((a, b) => {
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.points - a.points;
        });

      const winnerTeam = tournament.teams.find(
        (t) => t.id === poolStandings[0].teamId,
      );
      if (winnerTeam) {
        poolWinners.push(winnerTeam);
      }
    }

    this.logger.debug(
      `Pool winners: ${poolWinners.map((t) => t.name).join(', ')}`,
    );

    // Create single-elimination playoff bracket
    const numRounds = this.utilsService.calculateRounds(poolWinners.length);
    ladder.playoffs = this.buildPlayoffBracket(numRounds - 1, numRounds - 1);

    // Create first round of playoffs
    const teamPairs = this.utilsService.chunkIntoPairs(poolWinners);
    const games = [];

    for (const [firstTeam, secondTeam] of teamPairs) {
      const createGame: CreateGameDto = {
        teamIds: [firstTeam.id, secondTeam.id],
        status: GameStatusEnum.PENDING,
      };
      const game = await this.gameService.addGame(createGame, tournament.id);
      games.push(game);
    }

    // Assign games to playoff bracket
    const firstRoundElements = this.collectAllchildrensOfRound(
      0,
      ladder.playoffs,
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
      `Created playoff bracket with ${games.length} first round games`,
    );
  }

  private buildPlayoffBracket(
    roundNum: number,
    maxRound: number,
  ): LadderElement {
    const element: LadderElement = {
      name: `Playoff ${this.utilsService.getRoundName(roundNum, maxRound)}`,
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
        this.buildPlayoffBracket(roundNum - 1, maxRound),
        this.buildPlayoffBracket(roundNum - 1, maxRound),
      ];
    }

    return element;
  }
}
