import { Game } from 'src/modules/game/entities/game.entity';
import { Team } from 'src/modules/team/entities/team.entity';

/**
 * Interface for winner determination strategy
 */
export interface IWinnerStrategy {
  /**
   * Determines the winner of a game
   * @param teams - Teams to evaluate
   * @param game - Game with scores
   * @param inverse - If true, returns the loser instead
   * @returns The winning (or losing) team
   */
  getWinner(teams: Team[], game: Game, inverse?: boolean): Team;
}

/**
 * Configuration for ladder generation
 */
export interface LadderGenerationConfig {
  /** Whether to shuffle teams randomly */
  shuffleTeams?: boolean;

  /** Whether to automatically create next round games */
  autoProgress?: boolean;
}

/**
 * Result of ladder generation operation
 */
export interface LadderGenerationResult {
  /** Whether generation was successful */
  success: boolean;

  /** Error message if generation failed */
  error?: string;

  /** Number of games created */
  gamesCreated?: number;
}
