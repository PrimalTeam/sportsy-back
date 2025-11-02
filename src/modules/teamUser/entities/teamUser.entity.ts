import { BaseEntity } from 'src/interfaces/base.entity';
import { Team } from 'src/modules/team/entities/team.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('teamUsers')
export class TeamUser extends BaseEntity {
  @ApiPropertyOptional({ description: 'First name of the team member.' })
  @Column({ nullable: true })
  name?: string;

  @ApiPropertyOptional({ description: 'Surname of the team member.' })
  @Column({ nullable: true })
  surname?: string;

  @ApiPropertyOptional({
    description: 'Username or nickname of the team member.',
  })
  @Column({ nullable: true })
  username?: string;

  @ApiProperty({
    description: 'Team that the member belongs to.',
    type: () => Team,
  })
  @ManyToOne(() => Team, (team) => team.teamUsers, { onDelete: 'CASCADE' })
  team: Team;
}
