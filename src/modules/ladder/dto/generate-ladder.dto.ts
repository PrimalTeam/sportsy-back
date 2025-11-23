import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class GenerateLadderQueryDto {
  @ApiPropertyOptional({
    description: 'Whether to reset existing games before generating new ladder',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  reset?: boolean;
}
