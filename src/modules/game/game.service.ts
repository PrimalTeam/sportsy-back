import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { Tournament } from '../tournament/entities/tournament.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(Tournament)
    private readonly tournamentRepository: Repository<Tournament>,
  ) {}

  async create(createGameDto: CreateGameDto) {
    const game = new Game();

    game.status = createGameDto.status;
    game.dateStart = new Date(createGameDto.dateStart);
    game.durationTime = createGameDto.durationTime;
    game.gameActions = createGameDto.gameActions || [];

    if (createGameDto.tournamentId) {
      const tournament = await this.tournamentRepository.findOneBy({
        id: createGameDto.tournamentId,
      });
      if (!tournament) {
        throw new NotFoundException(
          `Tournament with ID ${createGameDto.tournamentId} not found`,
        );
      }
      // game.tournament = tournament;
    }

    return this.gameRepository.save(game);
  }

  findOne(id: number) {
    return this.gameRepository.findOneBy({ id });
  }
  async update(id: number, updateGameDto: UpdateGameDto) {
    const game = await this.gameRepository.findOneBy({ id });
    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    if (updateGameDto.status !== undefined) {
      game.status = updateGameDto.status;
    }
    if (updateGameDto.dateStart !== undefined) {
      game.dateStart = new Date(updateGameDto.dateStart);
    }
    if (updateGameDto.tournamentId !== undefined) {
      if (updateGameDto.tournamentId === null) {
        // game.tournament = null;
      } else {
        const tournament = await this.tournamentRepository.findOneBy({
          id: updateGameDto.tournamentId,
        });
        if (!tournament) {
          throw new NotFoundException(
            `Tournament with ID ${updateGameDto.tournamentId} not found`,
          );
        }
        // game.tournament = tournament;
      }
    }

    return this.gameRepository.save(game);
  }

  // findByTournamentId(tournamentId: number) {
  //   return this.gameRepository.find({
  //     where: { tournament: { id: tournamentId } },
  //     relations: ['tournament'],
  //   });
  // }

  remove(id: number) {
    return this.gameRepository.delete(id);
  }
}
