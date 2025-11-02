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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('tournaments')
@Controller('tournament')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @ApiOperation({ summary: 'List supported tournament sport types.' })
  @ApiOkResponse({
    description: 'Available sport types.',
    type: String,
    isArray: true,
  })
  @Get('sportTypes')
  async getSportTypes(): Promise<string[]> {
    return this.tournamentService.getTournamentSportTypes();
  }

  @ApiOperation({ summary: 'List supported tournament leader formats.' })
  @ApiOkResponse({
    description: 'Available leader types.',
    type: String,
    isArray: true,
  })
  @Get('leaderTypes')
  async getLeaderTypes(): Promise<string[]> {
    return this.tournamentService.getLeaderTypes();
  }

  @ApiOperation({ summary: 'Get tournament details with optional relations.' })
  @ApiOkResponse({ description: 'Tournament returned.', type: Tournament })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiParam({ name: 'tournamentId', type: Number })
  @ApiQuery({
    name: 'include',
    required: false,
    type: [String],
    description: 'Relations to include.',
  })
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole()
  @HttpCode(HttpStatus.OK)
  @Get(':roomId/:tournamentId')
  async getTournamentWithIncludes(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
    @Query('include') includes: string[] | string,
  ) {
    const normalizedIncludes = (
      Array.isArray(includes) ? includes : [includes]
    ).filter((value): value is string => Boolean(value));
    const tournament = await this.tournamentService.findByIdWithRelations(
      tournamentId,
      normalizedIncludes,
    );
    this.tournamentService.verifyTournamentFind(tournament);
    return tournament;
  }

  @ApiOperation({ summary: 'Update tournament details.' })
  @ApiOkResponse({ description: 'Tournament updated.', type: Tournament })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiParam({ name: 'tournamentId', type: Number })
  @ApiBody({ type: UpdateTournamentDto })
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
