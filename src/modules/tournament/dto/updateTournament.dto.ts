import { PartialType } from '@nestjs/swagger';
import { CreateTournamentDto } from './createTournament.dto';

export class UpdateTournamentDto extends PartialType(CreateTournamentDto) {}
