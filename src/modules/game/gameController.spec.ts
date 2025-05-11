import { Test, TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import { GameController } from './game.controller';
import { Game } from './entities/game.entity';
import { AppModule } from 'src/app.module';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GameStatusEnum } from './entities/game.entity';

describe('GameController (Integration with AppModule)', () => {
  let app: INestApplication;
  let gameController: GameController;
  let gameRepository: Repository<Game>;
  let createdGameId: number | undefined;
  const initialStatus = GameStatusEnum.PENDING;
  const initialDateStart = Date.now();
  const initialDuration = '01:00:00';
  const updatedStatus = GameStatusEnum.IN_PROGRESS;
  const updatedDuration = '01:30:00';
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    gameController = moduleFixture.get<GameController>(GameController);
    gameRepository = moduleFixture.get<Repository<Game>>(
      getRepositoryToken(Game),
    );
  });
  afterAll(async () => {
    if (createdGameId) {
      try {
        await gameRepository.delete(createdGameId);
      } catch (_error) {
        /* empty */
      }
    }
    await app.close();
  });

  describe('create', () => {
    it('should create a new game in the database using CreateGameDto', async () => {
      const createGameDto: CreateGameDto = {
        status: initialStatus,
        dateStart: initialDateStart,
        durationTime: initialDuration,
        teamStatuses: [],
        gameActions: ['Game Created'],
      };
      const result = await gameController.create(createGameDto);
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.status).toEqual(createGameDto.status);
      expect(result.dateStart).toEqual(createGameDto.dateStart);
      expect(result.durationTime).toEqual(createGameDto.durationTime);
      createdGameId = result.id;
      const dbGame = await gameRepository.findOneBy({ id: createdGameId });
      expect(dbGame).not.toBeNull();
      expect(dbGame?.status).toEqual(createGameDto.status);
      expect(dbGame?.dateStart).toEqual(createGameDto.dateStart);
    });
  });
  describe('findOne', () => {
    it('should find an existing game by ID', async () => {
      expect(createdGameId).toBeDefined();
      const result = await gameController.findOne(createdGameId!.toString());
      expect(result).toBeDefined();
      expect(result!.id).toEqual(createdGameId);
      expect(result!.status).toEqual(initialStatus);
      expect(result!.dateStart).toEqual(initialDateStart);
      expect(result!.durationTime).toEqual(initialDuration);
    });
    it('should return null or throw error for a non-existent ID', async () => {
      const nonExistentId = '999999';
      try {
        const result = await gameController.findOne(nonExistentId);
        expect(result).toBeNull();
      } catch (error) {
        expect(error.status).toEqual(404);
      }
    });
  });
  describe('update', () => {
    it('should update an existing game using UpdateGameDto', async () => {
      expect(createdGameId).toBeDefined();
      const updateGameDto: UpdateGameDto = {
        status: updatedStatus,
        durationTime: updatedDuration,
      };
      const result = await gameController.update(
        createdGameId!.toString(),
        updateGameDto,
      );
      expect(result).toBeDefined();
      expect(result!.id).toEqual(createdGameId);
      expect(result!.status).toEqual(updateGameDto.status);
      expect(result!.durationTime).toEqual(updateGameDto.durationTime);
      expect(result!.dateStart).toEqual(initialDateStart);
      const dbGame = await gameRepository.findOneBy({ id: createdGameId });
      expect(dbGame).not.toBeNull();
      expect(dbGame?.status).toEqual(updateGameDto.status);
      expect(dbGame?.durationTime).toEqual(updateGameDto.durationTime);
    });
  });
  describe('remove', () => {
    it('should remove an existing game', async () => {
      expect(createdGameId).toBeDefined();
      const result = await gameController.remove(createdGameId!.toString());
      expect(result).toBeDefined();
      const dbGame = await gameRepository.findOneBy({ id: createdGameId });
      expect(dbGame).toBeNull();
      createdGameId = undefined;
    });
    it('should handle removing a non-existent game gracefully', async () => {
      const nonExistentId = '999998';
      try {
        const _result = await gameController.remove(nonExistentId);
      } catch (error) {
        expect(error.status).toEqual(404);
      }
    });
  });
});
