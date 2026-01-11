import { ApiProperty } from '@nestjs/swagger';

export class ForecastItemDto {
  @ApiProperty({
    description: 'Forecast date and time',
    example: '2026-01-11 12:00:00',
  })
  dateTime: string;

  @ApiProperty({ description: 'Temperature in Celsius', example: 15.5 })
  temperature: number;

  @ApiProperty({
    description: 'Feels like temperature in Celsius',
    example: 14.2,
  })
  feelsLike: number;

  @ApiProperty({ description: 'Minimum temperature in Celsius', example: 13.0 })
  tempMin: number;

  @ApiProperty({ description: 'Maximum temperature in Celsius', example: 18.0 })
  tempMax: number;

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

  @ApiProperty({
    description: 'Probability of precipitation (0-1)',
    example: 0.3,
  })
  pop: number;
}

export class ForecastResponseDto {
  @ApiProperty({ description: 'City name', example: 'London' })
  city: string;

  @ApiProperty({ description: 'Country code', example: 'GB' })
  country: string;

  @ApiProperty({
    description: 'List of forecast items',
    type: [ForecastItemDto],
  })
  forecast: ForecastItemDto[];
}
