import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Health check endpoint.' })
  @ApiOkResponse({
    description: 'Returns a welcome message or health indicator.',
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
