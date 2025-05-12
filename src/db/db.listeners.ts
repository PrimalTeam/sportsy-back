import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  DataSource,
} from 'typeorm';
import { Game } from 'src/modules/game/entities/game.entity';
import { TeamStatus } from 'src/modules/teamStatus/entities/teamStatus.entity';
import { LadderService } from 'src/modules/ladder/ladder.service';
import { AfterQueryEvent } from 'typeorm/subscriber/event/QueryEvent';

@EventSubscriber()
export class GameSubscriber implements EntitySubscriberInterface<Game> {
  constructor(
    private readonly ladderService: LadderService,
    dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Game;
  }

  async afterQuery(event: AfterQueryEvent<Game>) {
    if ((event.rawResults as any).command == 'UPDATE') {
      const gameId = event.parameters[event.parameters.length - 1];
      const game = await event.manager.getRepository(Game).findOne({
        where: { id: gameId },
      });

      const tournamentId = game?.tournamentId;
      if (tournamentId) {
        await this.ladderService.updateLadderByTournamentId(tournamentId);
      }
    }
    // console.log(event.rawResults);
  }

  async afterInsert(event: InsertEvent<Game>) {
    // console.log('siema');
    await this.ladderService.updateLadderByTournamentId(
      event.entity.tournamentId,
    );
  }

  async afterUpdate(_event: UpdateEvent<Game>) {
    // const game = await event.manager.getRepository(Game).findOne({
    //   where: { id: event.entity?.id ?? event.databaseEntity?.id },
    // });
    // console.log(event.entity.id);
    // console.log(game);
    // const tournamentId = game?.tournamentId;
    // console.log('yes', tournamentId);
    // if (tournamentId) {
    //   const ladder =
    //     await this.ladderService.updateLadderByTournamentId(tournamentId);
    //   console.log(ladder);
    // }
  }
}

@EventSubscriber()
export class TeamStatusSubscriber
  implements EntitySubscriberInterface<TeamStatus>
{
  constructor(
    private readonly ladderService: LadderService,
    dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return TeamStatus;
  }

  async afterQuery(event: AfterQueryEvent<TeamStatus>) {
    if ((event.rawResults as any).command == 'UPDATE') {
      console.log('oh no', event.rawResults);
      const teamStatusId = event.parameters[event.parameters.length - 1];
      console.log(teamStatusId);
      const teamStatus = await event.manager.getRepository(TeamStatus).findOne({
        where: { id: teamStatusId },
        relations: { team: true },
      });

      const tournamentId = teamStatus?.team?.tournamentId;
      if (tournamentId) {
        await this.ladderService.updateLadderByTournamentId(tournamentId);
      }
    }
    // console.log(event.rawResults);
  }

  async afterInsert(event: InsertEvent<TeamStatus>) {
    const teamStatus = await event.manager.getRepository(TeamStatus).findOne({
      where: { id: event.entity.id },
      relations: { team: true },
    });
    if (teamStatus?.team?.tournamentId) {
      await this.ladderService.updateLadderByTournamentId(
        teamStatus.team.tournamentId,
      );
    }
  }

  async afterUpdate(_event: UpdateEvent<TeamStatus>) {
    // const teamStatusId = event.entity?.id ?? event.databaseEntity?.id;
    // const teamStatus = await event.manager.getRepository(TeamStatus).findOne({
    //   where: { id: teamStatusId },
    //   relations: { team: true },
    // });
    // if (teamStatus?.team?.tournamentId) {
    //   await this.ladderService.updateLadderByTournamentId(
    //     teamStatus.team.tournamentId,
    //   );
    // }
  }
}
