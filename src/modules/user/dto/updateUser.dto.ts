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

  @ApiProperty({
    description:
      'Profile picture as a base64-encoded image (a data URI is also accepted). Send null to remove it.',
    type: String,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly avatar?: string | null;
}
