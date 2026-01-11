import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class DeleteLadderQueryDto {
  @ApiProperty({
    description: 'Whether to also delete all associated games',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return true;
  })
  @IsBoolean()
  resetGames?: boolean = true;
}
