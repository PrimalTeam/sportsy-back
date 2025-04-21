import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {}

  async create(createGameDto: CreateGameDto) {
    const game = new Game();
    
    game.status = createGameDto.status;
    game.dateStart = new Date(createGameDto.dateStart);
    game.durationTime = createGameDto.durationTime;
    game.gameActions = createGameDto.gameActions || [];
    
    if (createGameDto.teamStatuses) {
      // game.teamStatuses = await this.teamStatusRepository.findByIds(
      //   createGameDto.teamStatuses
      // );
    }
    return this.gameRepository.save(game);
  }

  findOne(id: number) {
    return this.gameRepository.findOneBy({ id });
  }
  async update(id: number, updateGameDto: UpdateGameDto) {
    const game = await this.gameRepository.findOneBy({ id });
    if (!game) {
      throw new Error('Game not found');
    }
    if (updateGameDto.status !== undefined) {
      game.status = updateGameDto.status;
    }
    if (updateGameDto.dateStart !== undefined) {
      game.dateStart = new Date(updateGameDto.dateStart);
    }
    return this.gameRepository.save(game);
  }
  remove(id: number) {
    return this.gameRepository.delete(id);
  }
}