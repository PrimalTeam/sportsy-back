import { Controller } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { Repository } from 'typeorm';
import { Tournament } from './entities/tournament.entity';

@Controller('tournamet')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}
}
