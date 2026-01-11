import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetWeatherByCityDto {
  @ApiProperty({
    description: 'Name of the city',
    example: 'London',
  })
  @IsString()
  @IsNotEmpty()
  city: string;
}
