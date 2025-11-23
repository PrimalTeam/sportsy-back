import { Injectable } from '@nestjs/common';

/**
 * Utility service for ladder-related operations
 */
@Injectable()
export class LadderUtilsService {
  /**
   * Shuffles an array using Fisher-Yates algorithm
   * @param array - Array to shuffle
   * @returns Shuffled array (modifies in place and returns)
   */
  shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Calculates the number of rounds needed for a single elimination tournament
   * @param teamCount - Number of teams
   * @returns Number of rounds
   */
  calculateRounds(teamCount: number): number {
    if (teamCount <= 0) return 0;
    return Math.ceil(Math.log2(teamCount));
  }

  /**
   * Calculates the next power of 2 greater than or equal to the number
   * @param num - Input number
   * @returns Next power of 2
   */
  nextPowerOf2(num: number): number {
    const rounds = this.calculateRounds(num);
    return Math.pow(2, rounds);
  }

  /**
   * Calculates how many teams need to play preliminary games
   * @param teamCount - Total number of teams
   * @returns Number of teams that need byes
   */
  calculateByes(teamCount: number): number {
    const nextPower = this.nextPowerOf2(teamCount);
    return nextPower - teamCount;
  }

  /**
   * Gets the round name based on rounds remaining
   * @param currentRound - Current round number (0-indexed)
   * @param maxRound - Maximum round number
   * @returns Human-readable round name
   */
  getRoundName(currentRound: number, maxRound: number): string {
    const roundsRemaining = maxRound - currentRound;

    if (roundsRemaining === 0) return 'Final';
    if (roundsRemaining === 1) return 'Semi-Final';
    if (roundsRemaining === 2) return 'Quarter-Final';

    return `Round ${currentRound + 1}`;
  }

  /**
   * Validates that a number is within bounds of an array
   * @param index - Index to check
   * @param array - Array to check against
   * @returns True if index is valid
   */
  isValidIndex<T>(index: number, array: T[]): boolean {
    return index >= 0 && index < array.length;
  }

  /**
   * Safely gets an element from an array
   * @param array - Array to get from
   * @param index - Index to retrieve
   * @returns Element or undefined
   */
  safeGet<T>(array: T[], index: number): T | undefined {
    return this.isValidIndex(index, array) ? array[index] : undefined;
  }

  /**
   * Chunks an array into pairs
   * @param array - Array to chunk
   * @returns Array of pairs
   */
  chunkIntoPairs<T>(array: T[]): [T, T][] {
    const pairs: [T, T][] = [];
    for (let i = 0; i < array.length - 1; i += 2) {
      pairs.push([array[i], array[i + 1]]);
    }
    return pairs;
  }
}
