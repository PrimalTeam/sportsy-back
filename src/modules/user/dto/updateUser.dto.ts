import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Unique username for the user.',
    example: 'sportsy_admin_updated',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly username?: string;

  @ApiProperty({
    description: 'User email address.',
    example: 'updated@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiProperty({
    description: 'New user password.',
    example: 'NewStrongPassword123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  readonly password?: string;
}
