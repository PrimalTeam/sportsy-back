import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/interfaces/baseService';
import { DeepPartial, Repository } from 'typeorm';
import { TeamStatus } from './entities/teamStatus.entity';
import {
  CreateTeamStatusDto,
  GenerateTeamStatusDto,
} from './dto/createTeamStatus.dto';
import { GameService } from '../game/game.service';

@Injectable()
export class TeamStatusService extends BaseService<TeamStatus> {
  constructor(
    @InjectRepository(TeamStatus)
    private readonly teamStatusRepository: Repository<TeamStatus>,
    @Inject() private readonly gameService: GameService,
  ) {
    super(teamStatusRepository, TeamStatus);
  }

  async generateTeamStatus(generateTeamStatusDto: GenerateTeamStatusDto) {
    return this.teamStatusRepository.create(generateTeamStatusDto);
  }

  async createTeamStatus(
    createTeamStatus: DeepPartial<TeamStatus>,
    gameId: number,
  ) {
    const teamStatus = this.teamStatusRepository.create(createTeamStatus);
    teamStatus.gameId = gameId;
    const saved = await this.teamStatusRepository.save(teamStatus);
    await this.gameService.emitGameUpdatedById(gameId);
    return saved;
  }

  async addTeamStatus(
    createTeamStatus: CreateTeamStatusDto,
    gameId: number,
    touranmentId: number,
  ) {
    const game = await this.gameService.checkGameRelation(gameId, touranmentId);
    const createNew: DeepPartial<TeamStatus> = { ...createTeamStatus, game };
    return this.createTeamStatus(createNew, game.id);
  }

  async changeTeamScore(score: number, tournamentId, teamStatusId: number) {
    const teamStatus = await this.checkTeamStatusRelation(
      teamStatusId,
      tournamentId,
    );
    const result = await this.teamStatusRepository.update(
      { id: teamStatusId },
      { score },
    );
    await this.gameService.emitGameUpdatedById(teamStatus.game.id);
    return result;
  }

  async changeTeamStatusByGameTeamId(
    gameId: number,
    teamId: number,
    score: number,
  ) {
    const teamStatus = await this.teamStatusRepository.findOne({
      where: { game: { id: gameId }, team: { id: teamId } },
      relations: { game: true, team: true },
    });
    if (!teamStatus) {
      throw new HttpException(
        'TeamStatus not found for the given game and team.',
        HttpStatus.NOT_FOUND,
      );
    }
    const result = await this.teamStatusRepository.update(
      { id: teamStatus.id },
      { score },
    );
    await this.gameService.emitGameUpdatedById(teamStatus.game.id);
    return result;
  }

  async checkTeamStatusRelation(teamStatusId: number, touranmentId: number) {
    const teamStatus = await this.teamStatusRepository.findOne({
      where: { id: teamStatusId, game: { tournamentId: touranmentId } },
      relations: { game: true },
    });
    if (!teamStatus) {
      throw new HttpException(
        'The teamStatus you are trying access dont exists or you dont have access to it.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return teamStatus;
  }
}
