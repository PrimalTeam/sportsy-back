import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Registered email of the user.',
  })
  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @ApiProperty({ example: 'StrongPassword123', description: 'User password.' })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
