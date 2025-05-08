import { DeepPartial } from 'typeorm';
import { CreateTournamentDto } from './createTournament.dto';

export type UpdateTournamentDto = DeepPartial<CreateTournamentDto>;
