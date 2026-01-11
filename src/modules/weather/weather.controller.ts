import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { GetWeatherByCityDto } from './dto/get-weather-by-city.dto';
import { GetWeatherByCoordinatesDto } from './dto/get-weather-by-coordinates.dto';
import { WeatherResponseDto } from './dto/weather-response.dto';
import { ForecastResponseDto } from './dto/forecast-response.dto';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('city')
  @ApiOperation({ summary: 'Get weather information by city name' })
  @ApiQuery({
    name: 'city',
    description: 'City name',
    example: 'London',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Weather information retrieved successfully',
    type: WeatherResponseDto,
  })
  @ApiResponse({ status: 404, description: 'City not found' })
  @ApiResponse({ status: 502, description: 'Failed to fetch weather data' })
  async getWeatherByCity(
    @Query() query: GetWeatherByCityDto,
  ): Promise<WeatherResponseDto> {
    return this.weatherService.getWeatherByCity(query.city);
  }

  @Get('coordinates')
  @ApiOperation({ summary: 'Get weather information by coordinates' })
  @ApiQuery({
    name: 'lat',
    description: 'Latitude',
    example: 51.5074,
    required: true,
  })
  @ApiQuery({
    name: 'lon',
    description: 'Longitude',
    example: -0.1278,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Weather information retrieved successfully',
    type: WeatherResponseDto,
  })
  @ApiResponse({ status: 502, description: 'Failed to fetch weather data' })
  async getWeatherByCoordinates(
    @Query() query: GetWeatherByCoordinatesDto,
  ): Promise<WeatherResponseDto> {
    return this.weatherService.getWeatherByCoordinates(query.lat, query.lon);
  }

  @Get('forecast/city')
  @ApiOperation({ summary: 'Get 5-day weather forecast by city name' })
  @ApiQuery({
    name: 'city',
    description: 'City name',
    example: 'London',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: '5-day forecast retrieved successfully',
    type: ForecastResponseDto,
  })
  @ApiResponse({ status: 404, description: 'City not found' })
  @ApiResponse({ status: 502, description: 'Failed to fetch forecast data' })
  async getForecastByCity(
    @Query() query: GetWeatherByCityDto,
  ): Promise<ForecastResponseDto> {
    return this.weatherService.getForecastByCity(query.city);
  }

  @Get('forecast/coordinates')
  @ApiOperation({ summary: 'Get 5-day weather forecast by coordinates' })
  @ApiQuery({
    name: 'lat',
    description: 'Latitude',
    example: 51.5074,
    required: true,
  })
  @ApiQuery({
    name: 'lon',
    description: 'Longitude',
    example: -0.1278,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: '5-day forecast retrieved successfully',
    type: ForecastResponseDto,
  })
  @ApiResponse({ status: 502, description: 'Failed to fetch forecast data' })
  async getForecastByCoordinates(
    @Query() query: GetWeatherByCoordinatesDto,
  ): Promise<ForecastResponseDto> {
    return this.weatherService.getForecastByCoordinates(query.lat, query.lon);
  }
}
