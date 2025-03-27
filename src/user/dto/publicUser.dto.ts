import { IsNotEmpty, IsString } from 'class-validator';

export class PublicUserDto {
  @IsNotEmpty()
  readonly id: number;

  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly username: string;

  readonly createdAt: Date;
}
