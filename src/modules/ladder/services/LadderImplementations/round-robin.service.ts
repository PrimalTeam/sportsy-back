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
import { v4 as uuidv4 } from 'uuid';
import { Team } from '../../../team/entities/team.entity';

/**
 * Round Robin Ladder Service
 *
 * In round-robin tournaments, every team plays every other team.
 * Winner is determined by total wins/points accumulated.
 * No elimination - all teams play all their scheduled games.
 *
 * Structure:
 * - All teams in a single group
 * - Every team plays every other team once (or twice for double round-robin)
 * - Standings based on wins, losses, and points
 * - Can have multiple rounds where matchups repeat
 */
@Injectable()
export class RoundRobinService
  extends BaseLadderService
  implements ILadderService
{
  constructor(
    @InjectRepository(Tournament)
    tournamentRepository: Repository<Tournament>,
    gameService: GameService,
    private readonly winnerService: WinnerDeterminationService,
  ) {
    super(tournamentRepository, gameService);
  }

  async calcLadder(tournament: Tournament): Promise<void> {
    this.logger.log(
      `Calculating round robin ladder for tournament ${tournament.id}`,
    );

    const tournamentWithRelations = await this.findTournamentForLadder(
      tournament.id,
    );

    if (
      !tournamentWithRelations.teams ||
      tournamentWithRelations.teams.length < 3
    ) {
      throw new BadRequestException('Round robin requires at least 3 teams');
    }

    const ladder = await this.generateRoundRobinLadder(tournamentWithRelations);

    const tournamentToUpdate = await this.tournamentRepository.findOne({
      where: { id: tournament.id },
    });

    if (tournamentToUpdate) {
      tournamentToUpdate.leader = ladder;
      await this.tournamentRepository.save(tournamentToUpdate);
    }

    this.logger.log(
      `Round robin ladder generated successfully for tournament ${tournament.id}`,
    );
  }

  async updateLadderByTournamentId(tournamentId: number): Promise<unknown> {
    this.logger.log(`Updating ladder for tournament ${tournamentId}`);
    const tournament = await this.findTournamentForLadder(tournamentId);

    const ladder = tournament.leader;

    if (!ladder || !ladder.games) {
      this.logger.warn(`No ladder found for tournament ${tournamentId}`);
      return undefined;
    }

    const updatedLadder = await this.updateRoundRobinLadder(tournament, ladder);

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

    if (!ladder || !ladder.games) {
      this.logger.warn(`No ladder to update for tournament ${tournament.id}`);
      return undefined;
    }

    const updatedLadder = await this.updateRoundRobinLadder(
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
   * Generate round robin schedule with all matchups
   */
  private async generateRoundRobinLadder(tournament: Tournament) {
    const ladder: {
      type: string;
      games: LadderElement[];
      standings: Record<
        number,
        {
          teamId: number;
          teamName: string;
          wins: number;
          losses: number;
          draws: number;
          points: number;
          gamesPlayed: number;
        }
      >;
      rounds: number;
    } = {
      type: LeaderTypeEnum.ROUND_ROBIN,
      games: [],
      standings: {},
      rounds: 0,
    };

    const teams = [...tournament.teams];
    const numTeams = teams.length;

    // Initialize standings
    teams.forEach((team) => {
      ladder.standings[team.id] = {
        teamId: team.id,
        teamName: team.name,
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
        gamesPlayed: 0,
      };
    });

    // Generate all possible pairings (each team plays each other once)
    const matchups: Array<[Team, Team]> = [];
    for (let i = 0; i < numTeams; i++) {
      for (let j = i + 1; j < numTeams; j++) {
        matchups.push([teams[i], teams[j]]);
      }
    }

    this.logger.debug(
      `Generating ${matchups.length} games for ${numTeams} teams`,
    );

    // Create games for all matchups
    let roundNumber = 1;
    for (const [team1, team2] of matchups) {
      const createGame: CreateGameDto = {
        teamIds: [team1.id, team2.id],
        status: GameStatusEnum.PENDING,
      };
      const game = await this.gameService.addGame(createGame, tournament.id);

      ladder.games.push({
        name: `Round ${roundNumber} - ${team1.name} vs ${team2.name}`,
        roundNumber: roundNumber,
        teamIds: game.teamIds,
        teams: TeamLadderElement.createFromGame(game, [team1, team2]),
        id: uuidv4(),
        gameId: game.id,
        status: game.status,
        childrens: null,
      });

      // Organize games into rounds (simplified - real implementation would use proper round-robin scheduling)
      if (ladder.games.length % Math.floor(numTeams / 2) === 0) {
        roundNumber++;
      }
    }

    ladder.rounds = roundNumber;

    this.logger.log(
      `Generated round robin with ${ladder.games.length} games across ${ladder.rounds} rounds`,
    );
    return ladder;
  }

  /**
   * Update round robin ladder and standings
   */
  private async updateRoundRobinLadder(
    tournament: Tournament,
    ladder: {
      games: LadderElement[];
      standings: Record<
        number,
        {
          teamId: number;
          teamName: string;
          wins: number;
          losses: number;
          draws: number;
          points: number;
          gamesPlayed: number;
        }
      >;
      rounds: number;
    },
  ) {
    // Reset standings
    Object.values(ladder.standings).forEach((standing) => {
      standing.wins = 0;
      standing.losses = 0;
      standing.draws = 0;
      standing.points = 0;
      standing.gamesPlayed = 0;
    });

    // Update all games and recalculate standings
    for (const gameElement of ladder.games) {
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
            // Update winner stats
            ladder.standings[winner.id].wins += 1;
            ladder.standings[winner.id].points += 3; // 3 points for win
            ladder.standings[winner.id].gamesPlayed += 1;

            // Update loser stats
            ladder.standings[loser.id].losses += 1;
            ladder.standings[loser.id].gamesPlayed += 1;
          } else if (!winner && !loser) {
            // Draw - both teams get 1 point
            gameTeams.forEach((team) => {
              if (ladder.standings[team.id]) {
                ladder.standings[team.id].draws += 1;
                ladder.standings[team.id].points += 1;
                ladder.standings[team.id].gamesPlayed += 1;
              }
            });
          }
        }
      } else if (gameElement.gameId) {
        // Game was deleted, clear the element
        this.logger.warn(
          `Round robin game ${gameElement.gameId} not found, clearing`,
        );
        gameElement.gameId = null;
        gameElement.teamIds = null;
        gameElement.status = null;
        gameElement.teams = [];
      }
    }

    // Sort standings by points (then wins, then goal difference if implemented)
    const sortedStandings = Object.values(ladder.standings).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.gamesPlayed - a.gamesPlayed;
    });

    this.logger.debug(
      `Current leader: ${sortedStandings[0]?.teamName} with ${sortedStandings[0]?.points} points`,
    );

    return ladder;
  }
}
