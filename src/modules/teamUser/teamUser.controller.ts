import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('team-users')
@Controller('teamUser')
export class TeamUserController {}
