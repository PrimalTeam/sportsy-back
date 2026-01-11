import { IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetWeatherByCoordinatesDto {
  @ApiProperty({
    description: 'Latitude coordinate',
    example: 51.5074,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -0.1278,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  lon: number;
}
