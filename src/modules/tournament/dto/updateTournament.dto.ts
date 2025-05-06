import { DeepPartial } from 'typeorm';
import {
  TournamentInfo,
  TournamentSportTypeEnum,
} from '../entities/tournament.entity';
import { CreateTournamentDto } from './createTournament.dto';

export type UpdateTournamentDto = DeepPartial<CreateTournamentDto>;
