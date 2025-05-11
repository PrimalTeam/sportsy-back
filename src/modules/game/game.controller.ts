import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { UpdateGameDto } from './dto/update-game.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { GameService } from './game.service';
import { JwtGuard } from 'src/guards/auth.guard';
import { RoomGuard } from 'src/guards/room.guard';
import { RoomRole } from 'src/decorators/roomRole.decorator';
import { RoomUserRole } from '../roomUser/entities/roomUser.entity';
import { RoomFromRequest } from 'src/decorators/room.decorator';
import { Room } from '../room/entities/room.entity';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole()
  @Get('getByTournament/:roomId')
  findByTournamentId(@RoomFromRequest() room: Room) {
    return this.gameService.findByTournamentId(room.tournament.id);
  }

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole()
  @Get('team/:roomId/:teamId')
  findGamesOfTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @RoomFromRequest() room: Room,
  ) {
    return this.gameService.findGamesOfTeam(teamId, room.tournament.id);
  }

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  @Post(':roomId/:tournamentId')
  create(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
    @Body() createGameDto: CreateGameDto,
  ) {
    return this.gameService.addGame(createGameDto, tournamentId);
  }

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole()
  @Get(':roomId/:id')
  async getGameWithIncludes(
    @Param('id', ParseIntPipe) id: number,
    @Query('include') include: string[] | string,
  ) {
    include = Array.isArray(include) ? include : [include];
    const game = await this.gameService.findByIdWithRelations(id, include);
    this.gameService.verifyEntityFind(game);
    return game;
  }

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  @Patch(':roomId/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGameDto: UpdateGameDto,
  ) {
    return this.gameService.update(id, updateGameDto);
  }

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  @Delete(':roomId/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.remove(id);
  }
}
