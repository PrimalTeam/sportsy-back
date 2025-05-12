import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { CreateGameDto, GenerateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game, GameStatusEnum } from './entities/game.entity';
import { BaseService } from 'src/interfaces/baseService';
import { TeamService } from '../team/team.service';

@Injectable()
export class GameService extends BaseService<Game> {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @Inject() private readonly teamService: TeamService,
  ) {
    super(gameRepository, Game);
  }

  async generateEntity(generateGameDto: GenerateGameDto): Promise<Game> {
    return this.gameRepository.create(generateGameDto);
  }

  async create(createGameDto: DeepPartial<Game>, tournamentId: number) {
    if (!createGameDto.teamStatuses) {
      createGameDto.teamStatuses = [];
      createGameDto.teamIds.forEach((id) =>
        createGameDto.teamStatuses.push({ teamId: id } as any),
      );
    }
    const game = this.gameRepository.create(createGameDto);
    game.tournamentId = tournamentId;
    return this.gameRepository.save(game);
  }

  async update(id: number, updateGameDto: UpdateGameDto) {
    await this.checkEntityExistenceById(id);
    const whereOption: FindOptionsWhere<Game> = { id };
    await this.gameRepository.update(whereOption, updateGameDto);
    return this.findById(id);
  }

  findByTournamentId(tournamentId: number) {
    return this.gameRepository.find({
      where: { tournament: { id: tournamentId } },
      relations: { tournament: true },
    });
  }

  async remove(id: number) {
    await this.checkEntityExistenceById(id);
    return this.gameRepository.delete(id);
  }

  async findGamesOfTeam(teamId: number, touranmentId: number) {
    await this.checkTeams(teamId, touranmentId);
    return this.gameRepository
      .createQueryBuilder('game')
      .innerJoin('game.teams', 'team')
      .where('team.id = :teamId', { teamId: teamId })
      .getMany();
  }

  async addGame(createGameDto: CreateGameDto, touranmentId: number) {
    const teams = await this.checkTeams(createGameDto.teamIds, touranmentId);
    const createNew: DeepPartial<Game> = { ...createGameDto, teams };
    return this.create(createNew, touranmentId);
  }

  getGameStatuses() {
    return Object.values(GameStatusEnum);
  }

  async checkTeams(teamId: number | number[], touranmentId: number) {
    teamId = Array.isArray(teamId) ? teamId : [teamId];
    const teamsInTournament =
      await this.teamService.findTournamentTeams(touranmentId);
    const filtered = teamsInTournament.filter((team) =>
      teamId.includes(team.id),
    );
    if (filtered.length < teamId.length) {
      throw new HttpException(
        'The teams doesnt exists or not members of this tournament.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return filtered;
  }

  async checkGameRelation(gameId, touranmentId) {
    const game = await this.gameRepository.findOne({
      where: { id: gameId, tournamentId: touranmentId },
    });
    if (!game) {
      throw new HttpException(
        'The game you are trying access dont exists or you dont have access to it.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return game;
  }
}
