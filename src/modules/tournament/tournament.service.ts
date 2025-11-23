import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LeaderTypeEnum,
  Tournament,
  TournamentSportTypeEnum,
} from './entities/tournament.entity';
import { DeepPartial, Repository } from 'typeorm';
import {
  CreateTournamentDto,
  GenerateTournamentDto,
} from './dto/createTournament.dto';
import { UpdateTournamentDto } from './dto/updateTournament.dto';
import { TypeOrmUtils } from 'src/utils/typeorm-utils';

@Injectable()
export class TournamentService {
  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentRepository: Repository<Tournament>,
  ) {}

  async createTournament(
    tournamentDto: CreateTournamentDto,
    roomId: number,
  ): Promise<Tournament> {
    const newTournament = this.tournamentRepository.create(tournamentDto);
    newTournament.roomId = roomId;
    return this.tournamentRepository.save(newTournament);
  }

  async generateTournament(
    tournamentDto: GenerateTournamentDto,
  ): Promise<Tournament> {
    return this.tournamentRepository.create(tournamentDto);
  }

  async generateDefaultTournament(): Promise<Tournament> {
    const defaultTournament: GenerateTournamentDto = {
      info: {
        title: 'New Tournament',
        description: 'New Tournament',
      },
      internalConfig: {
        autogenerateGamesFromLadder: false,
      },
    };
    return this.generateTournament(defaultTournament);
  }

  async findById(id: number): Promise<Tournament> {
    return this.tournamentRepository.findOne({
      where: { id },
    });
  }

  findByIdWithRelations(touranmentId: number, includes: string[] = []) {
    return TypeOrmUtils.getEntityWithRelations(
      Tournament,
      this.tournamentRepository,
      touranmentId,
      includes,
    );
  }

  async updateTournament(
    updateTournamentDto: UpdateTournamentDto,
    tournamentId: number,
  ): Promise<Tournament> {
    if (
      (await this.tournamentRepository.findOne({
        where: { id: tournamentId },
      })) === null
    ) {
      throw new HttpException('Tournament not found', 404);
    }

    const updateTournament: DeepPartial<Tournament> = {
      ...updateTournamentDto,
    };

    await this.tournamentRepository.update(
      {
        id: tournamentId,
      },
      updateTournament,
    );

    return this.findById(tournamentId);
  }

  async deleteTournamentById(tournamentId: number): Promise<void> {
    const tournament = await this.tournamentRepository.findOne({
      where: { id: tournamentId },
    });
    if (!tournament) {
      throw new HttpException('Tournament not found', 404);
    }
    await this.tournamentRepository.delete(tournamentId);
  }

  getTournamentSportTypes(): string[] {
    return Object.values(TournamentSportTypeEnum);
  }

  getLeaderTypes(): string[] {
    return Object.values(LeaderTypeEnum);
  }

  verifyTournamentFind(tournament: Tournament | Tournament[] | null): void {
    if (!tournament) {
      throw new HttpException('Tournament not found', HttpStatus.NOT_FOUND);
    }
  }

  async checkRoomExistence(id: number): Promise<Tournament> {
    const tournament = await this.tournamentRepository.findOne({
      where: { id },
    });
    this.verifyTournamentFind(tournament);
    return tournament;
  }
}
