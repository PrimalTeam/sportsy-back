import { DeepPartial } from 'typeorm';
import { CreateTeamDto } from './createTeam.dto';

export type UpdateTeamDto = DeepPartial<CreateTeamDto>;
