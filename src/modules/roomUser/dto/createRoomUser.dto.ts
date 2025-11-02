import { UserIdentifierType } from 'src/modules/user/entities/user.entity';
import { RoomUserRole } from '../entities/roomUser.entity';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface RoomUserFindOptions {
  readonly identifier: string;
  readonly identifierType: UserIdentifierType;
}

export class CreateRoomUserDto implements RoomUserFindOptions {
  @ApiPropertyOptional({
    description: 'Role assigned to the user in the room.',
    enum: RoomUserRole,
    default: RoomUserRole.SPECTRATOR,
  })
  @IsEnum(RoomUserRole)
  @IsOptional()
  readonly role?: RoomUserRole;

  @ApiProperty({
    description:
      'Identifier used to look up the user (username, email, or ID).',
    example: 'player@example.com',
  })
  @IsString()
  readonly identifier: string;

  @ApiProperty({
    description: 'Type of identifier provided.',
    enum: UserIdentifierType,
    example: UserIdentifierType.EMAIL,
  })
  @IsEnum(UserIdentifierType)
  readonly identifierType: UserIdentifierType;
}

export class GenerateRoomUserDto implements RoomUserFindOptions {
  @ApiPropertyOptional({
    description: 'Room identifier used when changing roles.',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  readonly roomId?: number;

  @ApiProperty({
    description: 'Identifier used to look up the user.',
    example: 'player@example.com',
  })
  readonly identifier: string;

  @ApiProperty({
    description: 'Type of identifier provided.',
    enum: UserIdentifierType,
  })
  readonly identifierType: UserIdentifierType;

  @ApiProperty({
    description: 'Role assigned to the user.',
    enum: RoomUserRole,
  })
  readonly role: RoomUserRole;
}
