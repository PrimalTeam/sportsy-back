import { ApiProperty } from '@nestjs/swagger';

export class WeatherResponseDto {
  @ApiProperty({ description: 'City name', example: 'London' })
  city: string;

  @ApiProperty({ description: 'Country code', example: 'GB' })
  country: string;

  @ApiProperty({
    description: 'Temperature in Celsius',
    example: 15.5,
  })
  temperature: number;

  @ApiProperty({
    description: 'Feels like temperature in Celsius',
    example: 14.2,
  })
  feelsLike: number;

  @ApiProperty({ description: 'Humidity percentage', example: 75 })
  humidity: number;

  @ApiProperty({ description: 'Atmospheric pressure in hPa', example: 1013 })
  pressure: number;

  @ApiProperty({ description: 'Weather description', example: 'clear sky' })
  description: string;

  @ApiProperty({ description: 'Weather icon code', example: '01d' })
  icon: string;

  @ApiProperty({ description: 'Wind speed in m/s', example: 3.5 })
  windSpeed: number;

  @ApiProperty({ description: 'Cloudiness percentage', example: 20 })
  clouds: number;
}
