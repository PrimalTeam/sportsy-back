import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UpdateGameDto } from './dto/update-game.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { GameService } from './game.service';
import { JwtGuard } from 'src/guards/auth.guard';


@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

    
  @UseGuards(JwtGuard)
  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gameService.create(createGameDto);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameService.findOne(+id);
  }

  @UseGuards(JwtGuard)
  @Get('by-tournament/:tournamentId')
  findByTournamentId(@Param('tournamentId') tournamentId: string) {
    return this.gameService.findByTournamentId(+tournamentId);
  }


  @UseGuards(JwtGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gameService.update(+id, updateGameDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gameService.remove(+id);
  }
}