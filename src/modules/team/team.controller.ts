import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { JwtGuard } from 'src/guards/auth.guard';
import { RoomGuard } from 'src/guards/room.guard';
import { RoomRole } from 'src/decorators/roomRole.decorator';
import { RoomFromRequest } from 'src/decorators/room.decorator';
import { Room } from '../room/entities/room.entity';
import { CreateTeamDto } from './dto/createTeam.dto';
import { RoomUserRole } from '../roomUser/entities/roomUser.entity';
import { UpdateTeamDto } from './dto/updateTeam.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Team } from './entities/team.entity';

@ApiTags('teams')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @ApiOperation({
    summary: 'List teams for the tournament associated with the room.',
  })
  @ApiOkResponse({
    description: 'Teams found for the tournament.',
    type: Team,
    isArray: true,
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole()
  @Get('getByTournament/:roomId')
  getByTournament(@RoomFromRequest() room: Room) {
    return this.teamService.findTournamentTeams(room.tournament.id);
  }

  @ApiOperation({ summary: 'Create a new team within the tournament.' })
  @ApiCreatedResponse({ description: 'Team created successfully.', type: Team })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiBody({ type: CreateTeamDto })
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  @Post(':roomId/')
  create(@RoomFromRequest() room: Room, @Body() createTeamDto: CreateTeamDto) {
    return this.teamService.createTeam(createTeamDto, room.tournament.id);
  }

  @ApiOperation({ summary: 'Retrieve a team with optional relations.' })
  @ApiOkResponse({ description: 'Requested team with relations.', type: Team })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiParam({ name: 'teamId', type: Number })
  @ApiQuery({
    name: 'include',
    required: false,
    type: [String],
    description: 'Relations to include.',
  })
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole()
  @Get(':roomId/:teamId')
  async getTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Query('include') include: string | string[],
  ) {
    const includes = (Array.isArray(include) ? include : [include]).filter(
      (value): value is string => Boolean(value),
    );
    const team = await this.teamService.findByIdWithRelations(teamId, includes);
    this.teamService.verifyEntityFind(team);
    return team;
  }

  @ApiOperation({ summary: 'Update a team details.' })
  @ApiOkResponse({ description: 'Updated team data.', type: Team })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateTeamDto })
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  @Patch(':roomId/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @RoomFromRequest() room: Room,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamService.updateTeam(updateTeamDto, id, room.tournament.id);
  }

  @ApiOperation({ summary: 'Delete a team from the tournament.' })
  @ApiOkResponse({ description: 'Team removed successfully.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  @Delete(':roomId/:id')
  remove(@RoomFromRequest() room: Room, @Param('id', ParseIntPipe) id: number) {
    return this.teamService.removeTeam(id, room.tournament.id);
  }
}
