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
import { Game } from './entities/game.entity';

@ApiTags('games')
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @ApiOperation({
    summary: 'List games for a tournament within the specified room.',
  })
  @ApiOkResponse({
    description: 'Games found for the room tournament.',
    type: Game,
    isArray: true,
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole()
  @Get('getByTournament/:roomId')
  findByTournamentId(@RoomFromRequest() room: Room) {
    return this.gameService.findByTournamentId(room.tournament.id);
  }

  @ApiOperation({
    summary: 'List games played by a specific team within a room tournament.',
  })
  @ApiOkResponse({
    description: 'Games found for the team.',
    type: Game,
    isArray: true,
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiParam({ name: 'teamId', type: Number })
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole()
  @Get('team/:roomId/:teamId')
  findGamesOfTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @RoomFromRequest() room: Room,
  ) {
    return this.gameService.findGamesOfTeam(teamId, room.tournament.id);
  }

  @ApiOperation({ summary: 'Create a new game for a tournament.' })
  @ApiCreatedResponse({ description: 'Game created successfully.', type: Game })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiParam({ name: 'tournamentId', type: Number })
  @ApiBody({ type: CreateGameDto })
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  @Post(':roomId/:tournamentId')
  create(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
    @Body() createGameDto: CreateGameDto,
  ) {
    return this.gameService.addGame(createGameDto, tournamentId);
  }

  @ApiOperation({ summary: 'Get a game with optional relations.' })
  @ApiOkResponse({ description: 'Requested game with relations.', type: Game })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiParam({ name: 'id', type: Number, description: 'Game identifier.' })
  @ApiQuery({
    name: 'include',
    required: false,
    description: 'Relations to preload.',
    type: [String],
  })
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole()
  @Get(':roomId/:id')
  async getGameWithIncludes(
    @Param('id', ParseIntPipe) id: number,
    @Query('include') include: string[] | string,
  ) {
    const includes = (Array.isArray(include) ? include : [include]).filter(
      (value): value is string => Boolean(value),
    );
    const game = await this.gameService.findByIdWithRelations(id, includes);
    this.gameService.verifyEntityFind(game);
    return game;
  }

  @ApiOperation({ summary: 'Update an existing game.' })
  @ApiOkResponse({ description: 'Updated game data.', type: Game })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateGameDto })
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

  @ApiOperation({ summary: 'Remove a game from the schedule.' })
  @ApiOkResponse({ description: 'Game removed successfully.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  @Delete(':roomId/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.remove(id);
  }

  @ApiOperation({ summary: 'List supported game status values.' })
  @ApiOkResponse({
    description: 'List of possible game statuses.',
    type: String,
    isArray: true,
  })
  @Get('getGameStatuses')
  async getGameStatuses(): Promise<string[]> {
    return this.gameService.getGameStatuses();
  }
}
