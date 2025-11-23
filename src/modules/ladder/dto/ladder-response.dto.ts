import { ApiProperty } from '@nestjs/swagger';
import { GameStatusEnum } from 'src/modules/game/entities/game.entity';
import { LeaderTypeEnum } from 'src/modules/tournament/entities/tournament.entity';

export class TeamLadderElementDto {
  @ApiProperty({ description: 'Team ID' })
  id: number;

  @ApiProperty({ description: 'Team name' })
  name: string;

  @ApiProperty({ description: 'Team score in this game' })
  score: number;
}

export class LadderElementDto {
  @ApiProperty({ description: 'Round name (e.g., Final, Semi-Final)' })
  name: string;

  @ApiProperty({ description: 'Round number' })
  roundNumber: number;

  @ApiProperty({ description: 'Team IDs participating in this match' })
  teamIds: number[];

  @ApiProperty({
    description: 'Teams participating in this match',
    type: [TeamLadderElementDto],
  })
  teams: TeamLadderElementDto[];

  @ApiProperty({ description: 'Unique identifier for this ladder element' })
  id: string;

  @ApiProperty({
    description: 'Associated game ID',
    nullable: true,
  })
  gameId: number | null;

  @ApiProperty({
    description: 'Game status',
    enum: GameStatusEnum,
    nullable: true,
  })
  status: GameStatusEnum | null;

  @ApiProperty({
    description: 'Child matches feeding into this match',
    type: () => [LadderElementDto],
    nullable: true,
  })
  childrens: LadderElementDto[] | null;
}

export class LadderResponseDto {
  @ApiProperty({
    description: 'Type of tournament ladder',
    enum: LeaderTypeEnum,
  })
  type: LeaderTypeEnum;

  @ApiProperty({
    description: 'Main bracket structure',
    type: LadderElementDto,
    nullable: true,
  })
  mainLadder: LadderElementDto | null;

  @ApiProperty({
    description: 'Preliminary games for teams that need to play-in',
    type: [LadderElementDto],
  })
  preGames: LadderElementDto[];
}
