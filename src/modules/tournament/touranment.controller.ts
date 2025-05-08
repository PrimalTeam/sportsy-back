import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { Tournament } from './entities/tournament.entity';
import { UpdateTournamentDto } from './dto/updateTournament.dto';
import { JwtGuard } from 'src/guards/auth.guard';
import { RoomGuard } from 'src/guards/room.guard';
import { RoomRole } from 'src/decorators/roomRole.decorator';
import { RoomUserRole } from '../roomUser/entities/roomUser.entity';

@Controller('tournament')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Get('sportTypes')
  async getSportTypes(): Promise<string[]> {
    return this.tournamentService.getTournamentSportTypes();
  }

  @Get('leaderTypes')
  async getLeaderTypes(): Promise<string[]> {
    return this.tournamentService.getLeaderTypes();
  }

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole()
  @HttpCode(HttpStatus.OK)
  @Get(':roomId/:tournamentId')
  async getTournamentWithIncludes(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
    @Query('include') includes: string[] | string,
  ) {
    includes = Array.isArray(includes) ? includes : [includes];
    const tournament = await this.tournamentService.findByIdWithRelations(
      tournamentId,
      includes,
    );
    this.tournamentService.verifyTournamentFind(tournament);
    return tournament;
  }

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':roomId/:tournamentId')
  async updateTournament(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
    @Body() udateTournamentDto: UpdateTournamentDto,
  ): Promise<Tournament> {
    return this.tournamentService.updateTournament(
      udateTournamentDto,
      tournamentId,
    );
  }
}
