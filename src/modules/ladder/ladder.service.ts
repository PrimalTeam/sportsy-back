import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LeaderTypeEnum,
  Tournament,
} from '../tournament/entities/tournament.entity';
import { Repository } from 'typeorm';
import { CreateGameDto } from '../game/dto/create-game.dto';
import { Game, GameStatusEnum } from '../game/entities/game.entity';
import { GameService } from '../game/game.service';
import { v4 as uuidv4 } from 'uuid';
import { Team } from '../team/entities/team.entity';

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

export class TeamLadderElement {
  id: number;
  name: string;
  score: number;

  static createFromGame(game: Game, gameTeams: Team[]) {
    const teamLadderElements: TeamLadderElement[] = [];
    gameTeams.forEach((team) => {
      teamLadderElements.push(this.createFromTeamGame(game, team));
    });
    return teamLadderElements;
  }

  static createFromTeamGame(game: Game, team: Team): TeamLadderElement {
    const createTeamLadderElement: any = {
      name: team.name,
      id: team.id,
    };
    const teamStatuses = game.teamStatuses;
    const teamStatus = teamStatuses.find(
      (teamStatus) => teamStatus.teamId == team.id,
    );
    return { ...createTeamLadderElement, score: teamStatus.score };
  }
}

@Injectable()
export class LadderService {
  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentRepository: Repository<Tournament>,
    private readonly gameService: GameService,
  ) {}

  async findTournamentForLeadder(touranmentId: number) {
    return this.tournamentRepository.findOne({
      where: { id: touranmentId },
      relations: { games: { teamStatuses: true }, teams: true },
    });
  }

  async resetGames(touranmentId: number) {
    const tournament = await this.findTournamentForLeadder(touranmentId);

    const promises = tournament.games.map(async (game) => {
      await this.gameService.remove(game.id);
    });
    await Promise.all(promises);
    // await this.tournamentRepository.save(tournament);
  }

  async calcLadder(touranment: Tournament) {
    const tournamentGood = await this.findTournamentForLeadder(touranment.id);
    switch (touranment.leaderType) {
      case LeaderTypeEnum.SINGLE_ELIMINATION: {
        const ladder =
          await this.generateSingleEliminationLadder(tournamentGood);
        touranment.leader = ladder;
        await this.tournamentRepository.save(touranment);
        // return ladder;
        break;
      }
      case LeaderTypeEnum.POOL_PLAY:
        break;
    }
  }

  async updateLadderByTournamentId(touranmentId: number) {
    // console.log('maybe');
    const tournament = await this.findTournamentForLeadder(touranmentId);
    switch (tournament.leaderType) {
      case LeaderTypeEnum.SINGLE_ELIMINATION: {
        const ladder = tournament.leader;
        console.log(ladder);
        if (ladder.mainLadder != null) {
          console.log(ladder);
          const updatedLadder = await this.updateSingleEliminationLadder(
            tournament,
            ladder,
          );
          tournament.leader = updatedLadder;
          this.tournamentRepository.save(tournament);
          return updatedLadder;
        }
        break;
      }
      case LeaderTypeEnum.POOL_PLAY:
        break;
    }
  }

  async updateLadder(touranment: Tournament) {
    const tournamentGood = await this.findTournamentForLeadder(touranment.id);
    switch (touranment.leaderType) {
      case LeaderTypeEnum.SINGLE_ELIMINATION: {
        const ladder = touranment.leader;
        if (ladder.mainLadder != null) {
          console.log(ladder);
          const updatedLadder = await this.updateSingleEliminationLadder(
            tournamentGood,
            ladder,
          );
          touranment.leader = updatedLadder;
          this.tournamentRepository.save(touranment);
          return updatedLadder;
        }
        break;
      }
      case LeaderTypeEnum.POOL_PLAY:
        break;
    }
  }

  buildEmptySingleElaminationLadder(roundNum: number, maxRound: number) {
    const ladder: LadderElement = {
      name:
        maxRound - roundNum == 0
          ? 'Final'
          : maxRound - roundNum == 1
            ? 'Semi-Final'
            : 'Round ' + String(roundNum),
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
        this.buildEmptySingleElaminationLadder(roundNum - 1, maxRound),
        this.buildEmptySingleElaminationLadder(roundNum - 1, maxRound),
      ];
    }
    return ladder;
  }

  async generateSingleEliminationLadder(touranment: Tournament) {
    const ladder = {
      type: LeaderTypeEnum.SINGLE_ELIMINATION,
      mainLadder: null,
      preGames: [],
    };
    const games: Game[] = [];
    let teams = touranment.teams;
    const numOfRounds = Math.ceil(Math.log2(teams.length));
    const nextPower = Math.pow(2, numOfRounds);
    const byes = nextPower - teams.length;
    teams = this.shuffleArray(teams);

    ladder.mainLadder = this.buildEmptySingleElaminationLadder(
      numOfRounds - 2,
      numOfRounds - 2,
    );

    if (byes > 0) {
      ladder.mainLadder = this.buildEmptySingleElaminationLadder(
        numOfRounds - 2,
        numOfRounds - 2,
      );
      // const byesTeams = teams.slice(0, byes - 1);
      const playTeams = teams.slice(byes - 1, teams.length - 1);
      console.log(playTeams);
      console.log(teams);

      for (let index = 0; index < playTeams.length; index += 2) {
        const firstTeam = playTeams[index];
        const secondTeam = playTeams[index + 1];

        const createGame: CreateGameDto = {
          teamIds: [firstTeam.id, secondTeam.id],
          status: GameStatusEnum.PENDING,
        };
        const game = await this.gameService.addGame(createGame, touranment.id);
        games.push(game);
      }
      games.forEach((game) =>
        ladder.preGames.push({
          teamIds: game.teamIds,
          teams: TeamLadderElement.createFromGame(game, game.teams),
          status: game.status,
          gameId: game.id,
          id: uuidv4(),
        }),
      );
    } else {
      ladder.mainLadder = this.buildEmptySingleElaminationLadder(
        numOfRounds - 1,
        numOfRounds - 1,
      );
      for (let index = 0; index < teams.length; index += 2) {
        const firstTeam = teams[index];
        const secondTeam = teams[index + 1];

        const createGame: CreateGameDto = {
          teamIds: [firstTeam.id, secondTeam.id],
          status: GameStatusEnum.PENDING,
        };
        const game = await this.gameService.addGame(createGame, touranment.id);
        games.push(game);
      }
      const elements = this.collectAllchildrensOfRound(0, ladder.mainLadder);
      elements.forEach((element, index) => {
        element.teams = TeamLadderElement.createFromGame(
          games[index],
          games[index].teams,
        );
        element.teamIds = games[index].teamIds;
        element.gameId = games[index].id;
      });
    }
    return ladder;
  }

  async updateSingleEliminationLadder(
    tournament: Tournament,
    ladder: { mainLadder: LadderElement; preGames: any[] },
  ) {
    function getWinnerTeam(
      teams: Team[],
      game: Game,
      inverse: boolean = false,
    ) {
      teams.sort((a, b) => {
        const aTeamStatus = game.teamStatuses.find(
          (teamStatus) => teamStatus.teamId == a.id,
        );
        const bTeamStatus = game.teamStatuses.find(
          (teamStatus) => teamStatus.teamId == b.id,
        );

        if (!inverse)
          return aTeamStatus.score == bTeamStatus.score
            ? 0
            : aTeamStatus.score > bTeamStatus.score
              ? -1
              : 1;
        if (inverse)
          return aTeamStatus.score == bTeamStatus.score
            ? 0
            : aTeamStatus.score > bTeamStatus.score
              ? 1
              : -1;
      });
      return teams[0];
    }

    this.updateSingleEliminationLadderGames(tournament, ladder.mainLadder);
    ladder.preGames.forEach((element) => {
      const game = tournament.games.find((game) => game.id == element.gameId);
      let gameTeams = [];
      if (game) {
        gameTeams = tournament.teams.filter((team) =>
          game.teamIds.includes(team.id),
        );
      }
      element.gameId = game?.id ?? null;
      element.teamIds = game?.teamIds ?? null;
      element.status = game?.status ?? null;
      element.teams = game
        ? TeamLadderElement.createFromGame(game, gameTeams)
        : [];
    });
    console.log('updated');
    console.log(ladder);
    if (tournament.autoCreateFromLeader) {
      const elementsCanBeCreated = this.findLadderElemetsThatCanBeCreated([
        ladder.mainLadder,
      ]);
      console.log(elementsCanBeCreated);
      const promises = elementsCanBeCreated.map(async (element) => {
        console.log('main');
        const firstTeam = getWinnerTeam(
          tournament.teams.filter((team) =>
            element.childrens[0].teamIds.includes(team.id),
          ),
          tournament.games.find(
            (game) => game.id == element.childrens[0].gameId,
          ),
        );
        const secondTeam = getWinnerTeam(
          tournament.teams.filter((team) =>
            element.childrens[1].teamIds.includes(team.id),
          ),
          tournament.games.find(
            (game) => game.id == element.childrens[1].gameId,
          ),
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

      const preGamesFromWhatCanBeCreated = ladder.preGames.filter((preGame) => {
        return preGame.status == GameStatusEnum.COMPLETED;
      });
      console.log(this.collectAllchildrensOfRound(0, ladder.mainLadder)[0]);
      if (
        preGamesFromWhatCanBeCreated.length == ladder.preGames.length &&
        this.collectAllchildrensOfRound(0, ladder.mainLadder)[0].gameId == null
      ) {
        console.log('pre');
        const preGamesLostTeams = ladder.preGames.map((preGame) => {
          return getWinnerTeam(
            tournament.teams.filter((team) =>
              preGame.teamIds.includes(team.id),
            ),
            tournament.games.find((game) => game.id == preGame.gameId),
            true,
          );
        });
        let remainTeams = tournament.teams.filter(
          (team) =>
            !preGamesLostTeams.map((lostTeam) => lostTeam.id).includes(team.id),
        );
        const games: Game[] = [];
        const numOfRounds = Math.ceil(Math.log2(remainTeams.length));
        remainTeams = this.shuffleArray(remainTeams);
        for (let index = 0; index < remainTeams.length; index += 2) {
          const firstTeam = remainTeams[index];
          const secondTeam = remainTeams[index + 1];

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
        const elements = this.collectAllchildrensOfRound(
          numOfRounds,
          ladder.mainLadder,
        );
        elements.forEach((element, index) => {
          element.teams = TeamLadderElement.createFromGame(
            games[index],
            games[index].teams,
          );
          element.teamIds = games[index].teamIds;
          element.gameId = games[index].id;
        });
        console.log(games);
      }
    }
    return ladder;
  }

  findLadderElemetsThatCanBeCreated(ladders: LadderElement[]) {
    const ladderElements: LadderElement[] = [];
    for (let index = 0; index < ladders.length; index++) {
      if (ladders[index].childrens && ladders[index].gameId == null) {
        const children = ladders[index].childrens.filter(
          (element) =>
            element.gameId != null &&
            element.status == GameStatusEnum.COMPLETED,
        );
        if (children.length > 1) {
          ladderElements.push(ladders[index]);
        } else {
          const nestFind = this.findLadderElemetsThatCanBeCreated(
            ladders[index].childrens,
          );
          ladderElements.push(...nestFind);
        }
      }
    }
    return ladderElements;
  }

  updateSingleEliminationLadderGames(
    tournament: Tournament,
    ladder: LadderElement,
  ) {
    const elements = this.collectAllRounds(ladder);
    console.log(elements);
    elements.forEach((element) => {
      const game = tournament.games.find((game) => game.id == element.gameId);
      let gameTeams = [];
      if (game) {
        gameTeams = tournament.teams.filter((team) =>
          game.teamIds.includes(team.id),
        );
      }
      element.gameId = game?.id ?? null;
      element.teamIds = game?.teamIds ?? null;
      element.status = game?.status ?? null;
      element.teams = game
        ? TeamLadderElement.createFromGame(game, gameTeams)
        : [];
    });
  }

  collectAllRounds(ladders: LadderElement | LadderElement[]) {
    ladders = Array.isArray(ladders) ? ladders : [ladders];
    const ladderElements: LadderElement[] = [];
    for (let index = 0; index < ladders.length; index++) {
      if (ladders[index].childrens) {
        const elements = this.collectAllRounds(ladders[index].childrens);
        ladderElements.push(...elements);
      }
      ladderElements.push(ladders[index]);
    }
    return ladderElements;
  }

  collectAllchildrensOfRound(
    numOfRound: number,
    ladders: LadderElement | LadderElement[],
  ) {
    ladders = Array.isArray(ladders) ? ladders : [ladders];
    const ladderElements: LadderElement[] = [];
    for (let index = 0; index < ladders.length; index++) {
      if (
        ladders[index].roundNumber != numOfRound &&
        ladders[index].childrens
      ) {
        const elements = this.collectAllchildrensOfRound(
          numOfRound,
          ladders[index].childrens,
        );
        ladderElements.push(...elements);
      } else {
        ladderElements.push(ladders[index]);
      }
    }
    return ladderElements;
  }

  // async calcSingleEliminationLadder(touranment: Tournament) {
  //   const ladder = {
  //     type: LeaderTypeEnum.SINGLE_ELIMINATION,
  //     mainLadder: null,
  //     preGames: [],
  //   };
  //   const games: Game[] = [];
  //   let teams = touranment.teams;
  //   const numOfRounds = Math.ceil(Math.log2(teams.length));
  //   const nextPower = Math.pow(2, numOfRounds);
  //   const byes = nextPower - teams.length;
  //   teams = this.shuffleArray(teams);

  //   ladder.mainLadder = this.buildEmptySingleElaminationLadder(
  //     numOfRounds - 1,
  //     numOfRounds - 1,
  //   );
  //   // if (byes > 0) {
  //   // }
  // }

  shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
