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

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  @Post(':roomId/')
  create(@RoomFromRequest() room: Room, @Body() createTeamDto: CreateTeamDto) {
    return this.teamService.createTeam(createTeamDto, room.tournament.id);
  }

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole()
  @Get(':roomId/:teamId')
  getTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Query('include') include: string | string[],
  ) {
    include = Array.isArray(include) ? include : [include];
    return this.teamService.findByIdWithRelations(teamId, include);
  }

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

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  @Delete(':roomId/:id')
  remove(@RoomFromRequest() room: Room, @Param('id', ParseIntPipe) id: number) {
    return this.teamService.removeTeam(id, room.tournament.id);
  }
}
