import { IsString, IsNotEmpty } from 'class-validator';

export class LoginAuthDto {
  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
