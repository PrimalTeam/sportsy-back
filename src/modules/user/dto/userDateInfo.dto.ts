import { ApiProperty } from '@nestjs/swagger';

export class UserDateInfoDto {
  @ApiProperty({ description: 'Username of the authenticated user.' })
  username: string;

  @ApiProperty({
    description: 'Creation date of the user account.',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;
}
