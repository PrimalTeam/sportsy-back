import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublicUserDto {
  @ApiProperty({ description: 'Unique identifier of the user.', example: 1 })
  @IsNotEmpty()
  readonly id: number;

  @ApiProperty({
    description: 'Email address of the user.',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @ApiProperty({
    description: 'Username displayed publicly.',
    example: 'sportsy_admin',
  })
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @ApiProperty({
    description: 'Date when the account was created.',
    type: String,
    format: 'date-time',
    required: false,
  })
  readonly createdAt: Date;
}
