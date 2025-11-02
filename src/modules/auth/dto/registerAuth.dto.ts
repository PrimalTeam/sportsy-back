import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAuthDto {
  @ApiProperty({
    example: 'sportsy_admin',
    description: 'Unique username for the account.',
  })
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Valid email address.',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: 'StrongPassword123',
    description: 'Account password.',
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
