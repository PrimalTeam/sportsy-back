import { Injectable, Logger } from '@nestjs/common';
import { Game } from 'src/modules/game/entities/game.entity';
import { Team } from 'src/modules/team/entities/team.entity';
import { IWinnerStrategy } from '../interfaces/ladder.interface';

/**
 * Service to determine game winners based on scores
 */
@Injectable()
export class WinnerDeterminationService implements IWinnerStrategy {
  private readonly logger = new Logger(WinnerDeterminationService.name);

  /**
   * Determines the winner of a game by comparing team scores
   * @param teams - Teams participating in the game
   * @param game - Game with team statuses and scores
   * @param inverse - If true, returns the losing team
   * @returns The winning (or losing if inverse=true) team
   * @throws Error if game or teams are invalid
   */
  getWinner(teams: Team[], game: Game, inverse: boolean = false): Team {
    if (!teams || teams.length === 0) {
      throw new Error('No teams provided to determine winner');
    }

    if (!game || !game.teamStatuses || game.teamStatuses.length === 0) {
      throw new Error('Invalid game data for winner determination');
    }

    const sortedTeams = [...teams].sort((teamA, teamB) => {
      const teamAStatus = game.teamStatuses.find(
        (status) => status.teamId === teamA.id,
      );
      const teamBStatus = game.teamStatuses.find(
        (status) => status.teamId === teamB.id,
      );

      if (!teamAStatus || !teamBStatus) {
        this.logger.warn(
          `Missing team status for team ${!teamAStatus ? teamA.id : teamB.id} in game ${game.id}`,
        );
        return 0;
      }

      const scoreA = teamAStatus.score ?? 0;
      const scoreB = teamBStatus.score ?? 0;

      if (scoreA === scoreB) return 0;

      // Normal sort: descending (winner first)
      // Inverse sort: ascending (loser first)
      return inverse ? scoreA - scoreB : scoreB - scoreA;
    });

    return sortedTeams[0];
  }

  /**
   * Gets the loser of a game
   * @param teams - Teams participating in the game
   * @param game - Game with team statuses and scores
   * @returns The losing team
   */
  getLoser(teams: Team[], game: Game): Team {
    return this.getWinner(teams, game, true);
  }
}
