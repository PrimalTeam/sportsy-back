import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WeatherResponseDto } from './dto/weather-response.dto';
import { ForecastResponseDto } from './dto/forecast-response.dto';

@Injectable()
export class WeatherService {
  private readonly WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

  constructor(private configService: ConfigService) {}

  async getWeatherByCity(city: string): Promise<WeatherResponseDto> {
    const apiKey = this.configService.get<string>('WEATHER_API_KEY');

    if (!apiKey) {
      throw new HttpException(
        'Weather API key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const response = await fetch(
        `${this.WEATHER_API_URL}/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Weather API error:', response.status, errorData);

        if (response.status === 404) {
          throw new HttpException('City not found', HttpStatus.NOT_FOUND);
        }
        if (response.status === 401) {
          console.error(apiKey);
          throw new HttpException(
            'Invalid API key',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        throw new HttpException(
          `Failed to fetch weather data: ${errorData.message || response.statusText}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = await response.json();

      return {
        city: data.name,
        country: data.sys.country,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        clouds: data.clouds.all,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error fetching weather data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getWeatherByCoordinates(
    lat: number,
    lon: number,
  ): Promise<WeatherResponseDto> {
    const apiKey = this.configService.get<string>('WEATHER_API_KEY');

    if (!apiKey) {
      throw new HttpException(
        'Weather API key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const response = await fetch(
        `${this.WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Weather API error:', response.status, errorData);

        if (response.status === 401) {
          throw new HttpException(
            'Invalid API key',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        throw new HttpException(
          `Failed to fetch weather data: ${errorData.message || response.statusText}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = await response.json();

      return {
        city: data.name,
        country: data.sys.country,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        clouds: data.clouds.all,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error fetching weather data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getForecastByCity(city: string): Promise<ForecastResponseDto> {
    const apiKey = this.configService.get<string>('WEATHER_API_KEY');

    if (!apiKey) {
      throw new HttpException(
        'Weather API key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const response = await fetch(
        `${this.WEATHER_API_URL}/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Weather API error:', response.status, errorData);

        if (response.status === 404) {
          throw new HttpException('City not found', HttpStatus.NOT_FOUND);
        }
        if (response.status === 401) {
          throw new HttpException(
            'Invalid API key',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        throw new HttpException(
          `Failed to fetch forecast data: ${errorData.message || response.statusText}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = await response.json();

      return {
        city: data.city.name,
        country: data.city.country,
        forecast: data.list.map((item: any) => ({
          dateTime: item.dt_txt,
          temperature: item.main.temp,
          feelsLike: item.main.feels_like,
          tempMin: item.main.temp_min,
          tempMax: item.main.temp_max,
          humidity: item.main.humidity,
          pressure: item.main.pressure,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          windSpeed: item.wind.speed,
          clouds: item.clouds.all,
          pop: item.pop,
        })),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error fetching forecast data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getForecastByCoordinates(
    lat: number,
    lon: number,
  ): Promise<ForecastResponseDto> {
    const apiKey = this.configService.get<string>('WEATHER_API_KEY');

    if (!apiKey) {
      throw new HttpException(
        'Weather API key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const response = await fetch(
        `${this.WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Weather API error:', response.status, errorData);

        if (response.status === 401) {
          throw new HttpException(
            'Invalid API key',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        throw new HttpException(
          `Failed to fetch forecast data: ${errorData.message || response.statusText}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = await response.json();

      return {
        city: data.city.name,
        country: data.city.country,
        forecast: data.list.map((item: any) => ({
          dateTime: item.dt_txt,
          temperature: item.main.temp,
          feelsLike: item.main.feels_like,
          tempMin: item.main.temp_min,
          tempMax: item.main.temp_max,
          humidity: item.main.humidity,
          pressure: item.main.pressure,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          windSpeed: item.wind.speed,
          clouds: item.clouds.all,
          pop: item.pop,
        })),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error fetching forecast data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
