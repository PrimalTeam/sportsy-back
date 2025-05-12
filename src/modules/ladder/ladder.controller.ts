import {
  Controller,
  Get,
  ParseBoolPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LadderService } from './ladder.service';
import { RoomFromRequest } from 'src/decorators/room.decorator';
import { Room } from '../room/entities/room.entity';
import { JwtGuard } from 'src/guards/auth.guard';
import { RoomGuard } from 'src/guards/room.guard';
import { RoomRole } from 'src/decorators/roomRole.decorator';
import { RoomUserRole } from '../roomUser/entities/roomUser.entity';

@Controller('ladder')
export class LadderController {
  constructor(private readonly ladderService: LadderService) {}

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  @Get('/generateLadder/:roomId')
  async generate(
    @RoomFromRequest() room: Room,
    @Query('reset', new ParseBoolPipe({ optional: true })) reset?: boolean,
  ) {
    if (reset == true) {
      console.log(reset);
      await this.ladderService.resetGames(room.tournament.id);
    }
    this.ladderService.calcLadder(room.tournament);
  }

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  @Get('/update/:roomId')
  update(@RoomFromRequest() room: Room) {
    return this.ladderService.updateLadder(room.tournament);
  }
}
