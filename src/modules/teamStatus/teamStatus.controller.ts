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
import { CreateTeamStatusDto } from './dto/createTeamStatus.dto';

@Controller('teamStatus')
export class TeamStatusController {
  constructor(private readonly teamStatusService: TeamStatusService) {}

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

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN, RoomUserRole.GAMEOBSERVER)
  @Patch(':roomId/:teamStatusId')
  changeTeamStatus(
    @RoomFromRequest() room: Room,
    @Param('teamStatusId', ParseIntPipe) teamStatusId: number,
    @Body() updateScore: { score: number },
  ) {
    return this.teamStatusService.changeTeamScore(
      updateScore.score,
      room.tournament.id,
      teamStatusId,
    );
  }
}
