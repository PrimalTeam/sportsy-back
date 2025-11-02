import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TeamStatusService } from './teamStatus.service';
import { JwtGuard } from 'src/guards/auth.guard';
import { RoomRole } from 'src/decorators/roomRole.decorator';
import { RoomGuard } from 'src/guards/room.guard';
import { RoomUserRole } from '../roomUser/entities/roomUser.entity';
import { RoomFromRequest } from 'src/decorators/room.decorator';
import { Room } from '../room/entities/room.entity';
import {
  CreateTeamStatusDto,
  UpdateTeamStatusScoreDto,
} from './dto/createTeamStatus.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TeamStatus } from './entities/teamStatus.entity';

@ApiTags('team-statuses')
@Controller('teamStatus')
export class TeamStatusController {
  constructor(private readonly teamStatusService: TeamStatusService) {}

  @ApiOperation({ summary: 'Add a new team status to a game.' })
  @ApiCreatedResponse({
    description: 'Team status created successfully.',
    type: TeamStatus,
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiParam({ name: 'gameId', type: Number })
  @ApiBody({ type: CreateTeamStatusDto })
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN, RoomUserRole.GAMEOBSERVER)
  @Post(':roomId/:gameId')
  addTeamStatus(
    @RoomFromRequest() room: Room,
    @Param('gameId', ParseIntPipe) gameId: number,
    @Body() createTeamStatusDto: CreateTeamStatusDto,
  ) {
    return this.teamStatusService.addTeamStatus(
      createTeamStatusDto,
      gameId,
      room.tournament.id,
    );
  }

  @ApiOperation({ summary: 'Update score for a team status entry.' })
  @ApiOkResponse({
    description: 'Team status score updated.',
    type: TeamStatus,
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiParam({ name: 'teamStatusId', type: Number })
  @ApiBody({ type: UpdateTeamStatusScoreDto })
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN, RoomUserRole.GAMEOBSERVER)
  @Patch(':roomId/:teamStatusId')
  changeTeamStatus(
    @RoomFromRequest() room: Room,
    @Param('teamStatusId', ParseIntPipe) teamStatusId: number,
    @Body() updateScore: UpdateTeamStatusScoreDto,
  ) {
    return this.teamStatusService.changeTeamScore(
      updateScore.score,
      room.tournament.id,
      teamStatusId,
    );
  }
}
