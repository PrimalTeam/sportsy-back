import {
  CreateTournamentDto,
  GenerateTournamentDto,
} from 'src/modules/tournament/dto/createTournament.dto';
import { CreateRoomUserDto } from 'src/modules/roomUser/dto/createRoomUser.dto';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Display name of the room.',
    example: 'Championship Room',
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiPropertyOptional({
    description: 'Binary icon for the room encoded as bytes.',
  })
  readonly icon?: Buffer;

  @ApiPropertyOptional({
    description: 'Initial members of the room with their roles.',
    type: () => [CreateRoomUserDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateRoomUserDto)
  readonly roomUsers?: CreateRoomUserDto[];

  @ApiPropertyOptional({
    description: 'Tournament to create along with the room.',
    type: () => GenerateTournamentDto,
  })
  @ValidateNested({ each: true })
  @Type(() => GenerateTournamentDto)
  readonly tournament?: CreateTournamentDto;
}
