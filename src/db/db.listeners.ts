import {
  EventSubscriber,
  EntitySubscriberInterface,
  UpdateEvent,
  DataSource,
} from 'typeorm';
import type { QueryEvent } from 'typeorm/subscriber/event/QueryEvent';
import { Inject } from '@nestjs/common';
import { Game } from 'src/modules/game/entities/game.entity';
import { TeamStatus } from 'src/modules/teamStatus/entities/teamStatus.entity';
import { ILadderService } from 'src/modules/ladder/interfaces/ladder-service.interface';

@EventSubscriber()
export class GameSubscriber implements EntitySubscriberInterface<Game> {
  private isUpdating = false;

  constructor(
    @Inject('ILadderService')
    private readonly ladderService: ILadderService,
    dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Game;
  }

  async afterUpdate(event: UpdateEvent<Game>) {
    if (this.isUpdating) return;

    // TypeORM's afterUpdate doesn't reliably provide entity IDs
    // We need to check if we have update criteria with an ID
    const updateCriteria = event.entity;

    // If we don't have direct access to the ID, skip this update
    // The afterInsert hook will handle new games, and manual service calls
    // will handle updates that matter
    if (!updateCriteria || typeof updateCriteria !== 'object') {
      return;
    }

    // Try to extract ID from the update criteria
    const gameId =
      'id' in updateCriteria
        ? (updateCriteria as { id: number }).id
        : undefined;

    if (!gameId) {
      // This is expected for bulk updates or certain TypeORM operations
      // We can safely skip these as they're usually internal operations
      return;
    }

    const game = await event.manager.getRepository(Game).findOne({
      where: { id: gameId },
    });

    if (game?.tournamentId) {
      console.log(
        `Updating ladder for tournament ${game.tournamentId} after game ${gameId} update`,
      );

      try {
        this.isUpdating = true;
        await this.ladderService.updateLadderByTournamentId(game.tournamentId);
      } finally {
        this.isUpdating = false;
      }
    }
  }

  async afterQuery(event: QueryEvent<Game>) {
    if (this.isUpdating) return;

    // Check if this is an UPDATE query on Game
    const rawResult = event.query as { command?: string };
    if (String(rawResult).startsWith('UPDATE "game"')) {
      // Extract teamStatusId from query parameters (last parameter is usually the ID in WHERE clause)
      const gameId = event.parameters?.[event.parameters.length - 1];

      if (gameId && typeof gameId === 'number') {
        try {
          this.isUpdating = true;

          const game = await event.connection.manager
            .getRepository(Game)
            .findOne({
              where: { id: gameId },
              relations: {},
            });

          if (game?.tournamentId) {
            await this.ladderService.updateLadderByTournamentId(
              game.tournamentId,
            );
          }
        } finally {
          this.isUpdating = false;
        }
      }
    }
  }
}

@EventSubscriber()
export class TeamStatusSubscriber
  implements EntitySubscriberInterface<TeamStatus>
{
  private isUpdating = false;

  constructor(
    @Inject('ILadderService')
    private readonly ladderService: ILadderService,
    dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return TeamStatus;
  }

  async afterQuery(event: QueryEvent<TeamStatus>) {
    if (this.isUpdating) return;

    // Check if this is an UPDATE query on TeamStatus
    const rawResult = event.query as { command?: string };
    if (String(rawResult).startsWith('UPDATE "teamStatuses"')) {
      // Extract teamStatusId from query parameters (last parameter is usually the ID in WHERE clause)
      const teamStatusId = event.parameters?.[event.parameters.length - 1];

      if (teamStatusId && typeof teamStatusId === 'number') {
        try {
          this.isUpdating = true;

          const teamStatus = await event.connection.manager
            .getRepository(TeamStatus)
            .findOne({
              where: { id: teamStatusId },
              relations: { team: true },
            });

          if (teamStatus?.team?.tournamentId) {
            await this.ladderService.updateLadderByTournamentId(
              teamStatus.team.tournamentId,
            );
          }
        } finally {
          this.isUpdating = false;
        }
      }
    }
  }
}
