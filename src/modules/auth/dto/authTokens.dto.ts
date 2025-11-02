import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensDto {
  @ApiProperty({ description: 'JWT access token used to authorize requests.' })
  access_token: string;

  @ApiProperty({
    description: 'JWT refresh token used to obtain new access tokens.',
  })
  refresh_token: string;
}
