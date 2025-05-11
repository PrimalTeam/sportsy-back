import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamStatus } from './entities/teamStatus.entity';
import { TeamStatusController } from './teamStatus.controller';
import { TeamStatusService } from './teamStatus.service';

@Module({
  imports: [TypeOrmModule.forFeature([TeamStatus])],
  controllers: [TeamStatusController],
  providers: [TeamStatusService],
  exports: [TeamStatusService],
})
export class TeamModule {}
