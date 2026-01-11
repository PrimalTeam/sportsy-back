import {
  Controller,
  Get,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { ILadderService } from './interfaces/ladder-service.interface';
import { RoomFromRequest } from 'src/decorators/room.decorator';
import { Room } from '../room/entities/room.entity';
import { JwtGuard } from 'src/guards/auth.guard';
import { RoomGuard } from 'src/guards/room.guard';
import { RoomRole } from 'src/decorators/roomRole.decorator';
import { RoomUserRole } from '../roomUser/entities/roomUser.entity';
import { GenerateLadderQueryDto } from './dto/generate-ladder.dto';
import { DeleteLadderQueryDto } from './dto/delete-ladder.dto';
import { LadderResponseDto, LadderElementDto } from './dto/ladder-response.dto';

@ApiTags('Ladder')
@Controller('ladder')
export class LadderController {
  private readonly logger = new Logger(LadderController.name);

  constructor(
    @Inject('ILadderService') private readonly ladderService: ILadderService,
  ) {}

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  @Get('/generateLadder/:roomId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generate tournament ladder',
    description:
      'Generates a tournament bracket/ladder based on tournament type and teams',
  })
  @ApiParam({ name: 'roomId', type: Number })
  @ApiQuery({
    name: 'reset',
    required: false,
    type: Boolean,
    description: 'Whether to reset existing games before generating',
  })
  @ApiResponse({
    status: 200,
    description: 'Ladder generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid tournament data or insufficient teams',
  })
  @ApiResponse({
    status: 404,
    description: 'Room or tournament not found',
  })
  async generate(
    @RoomFromRequest() room: Room,
    @Query() query: GenerateLadderQueryDto,
  ): Promise<void> {
    this.logger.log(
      `Generating ladder for room ${room.id}, tournament ${room.tournament.id}`,
    );

    if (query.reset === true || String(query.reset) === 'true') {
      this.logger.log('Resetting existing games before generation');
      await this.ladderService.resetGames(room.tournament.id);
    }

    await this.ladderService.calcLadder(room.tournament);

    this.logger.log('Ladder generation completed');
  }

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  @Get('/update/:roomId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', type: Number })
  @ApiOperation({
    summary: 'Update tournament ladder',
    description:
      'Updates ladder with current game results and progresses tournament',
  })
  @ApiResponse({
    status: 200,
    description: 'Ladder updated successfully',
    type: LadderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Room, tournament, or ladder not found',
  })
  async update(
    @RoomFromRequest() room: Room,
  ): Promise<
    { mainLadder: LadderElementDto; preGames: LadderElementDto[] } | undefined
  > {
    this.logger.log(
      `Updating ladder for room ${room.id}, tournament ${room.tournament.id}`,
    );

    const result = (await this.ladderService.updateLadder(room.tournament)) as
      | LadderResponseDto
      | undefined;

    this.logger.log('Ladder update completed');
    return result;
  }

  @UseGuards(JwtGuard, RoomGuard)
  @RoomRole(RoomUserRole.ADMIN)
  @Delete('/delete/:roomId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiParam({
    name: 'roomId',
    type: Number,
    description: 'The room ID containing the tournament',
    example: 1,
  })
  @ApiQuery({
    name: 'resetGames',
    required: false,
    type: Boolean,
    description: 'Whether to also delete all associated games',
    example: true,
  })
  @ApiOperation({
    summary: 'Delete tournament ladder',
    description:
      'Deletes the tournament ladder structure. Optionally deletes all associated games if resetGames is true (default: true).',
  })
  @ApiResponse({
    status: 200,
    description:
      'Ladder deleted successfully. Games deleted if resetGames was true.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Ladder deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete ladder',
  })
  @ApiResponse({
    status: 404,
    description: 'Room or tournament not found',
  })
  async delete(
    @RoomFromRequest() room: Room,
    @Query() query: DeleteLadderQueryDto,
  ): Promise<{ message: string }> {
    const resetGames = query.resetGames ?? true;

    this.logger.log(
      `Deleting ladder for room ${room.id}, tournament ${room.tournament.id} (resetGames: ${resetGames})`,
    );

    await this.ladderService.deleteLadder(room.tournament.id, resetGames);

    this.logger.log('Ladder deletion completed');

    return {
      message: resetGames
        ? 'Ladder and associated games deleted successfully'
        : 'Ladder deleted successfully (games preserved)',
    };
  }
}
