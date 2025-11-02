import { PartialType } from '@nestjs/swagger';
import { CreateTeamDto } from './createTeam.dto';

export class UpdateTeamDto extends PartialType(CreateTeamDto) {}
