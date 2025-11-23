import { Tournament } from '../../tournament/entities/tournament.entity';

/**
 * Public interface for ladder operations.
 * Implementations may support different ladder/leader types.
 */
export interface ILadderService {
  /**
   * Generate ladder for a tournament (create games etc.)
   */
  calcLadder(tournament: Tournament): Promise<void>;

  /**
   * Update ladder for a tournament (progress bracket based on results)
   */
  updateLadder(tournament: Tournament): Promise<unknown>;

  /**
   * Convenience: update ladder by tournament id
   */
  updateLadderByTournamentId(tournamentId: number): Promise<unknown>;

  /**
   * Reset/remove all games for a tournament
   */
  resetGames(tournamentId: number): Promise<void>;
}
