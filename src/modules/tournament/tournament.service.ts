import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomUser } from '../roomUser/entities/roomUser.entity';
import { Tournament } from './entities/tournament.entity';
import { Repository } from 'typeorm';
import {
  CreateTournamentDto,
  GenerateTournamentDto,
} from './dto/createTournament.dto';

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
}
