/**
 * Shared types for ladder/bracket structures.
 * Used by all ladder service implementations.
 */

import { Game, GameStatusEnum } from '../game/entities/game.entity';
import { Team } from '../team/entities/team.entity';

/**
 * Represents a node in the ladder/bracket tree structure
 */
export class LadderElement {
  name: string;
  roundNumber: number;
  teamIds: number[];
  teams: TeamLadderElement[];
  id: string;
  gameId: number | null;
  status: GameStatusEnum | null;
  childrens: LadderElement[] | null;
}

/**
 * Represents a team in a ladder element with their current score
 */
export class TeamLadderElement {
  id: number;
  name: string;
  score: number;

  static createFromGame(game: Game, gameTeams: Team[]): TeamLadderElement[] {
    const teamLadderElements: TeamLadderElement[] = [];
    gameTeams.forEach((team) => {
      teamLadderElements.push(this.createFromTeamGame(game, team));
    });
    return teamLadderElements;
  }

  static createFromTeamGame(game: Game, team: Team): TeamLadderElement {
    const teamLadderElement: Partial<TeamLadderElement> = {
      name: team.name,
      id: team.id,
    };

    const teamStatuses = game.teamStatuses;
    const teamStatus = teamStatuses.find((status) => status.teamId === team.id);

    return {
      ...teamLadderElement,
      score: teamStatus?.score ?? 0,
    } as TeamLadderElement;
  }
}
