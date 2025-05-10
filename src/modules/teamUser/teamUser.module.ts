import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamUser } from './entities/teamUser.entity';
import { TeamUserController } from './teamUser.controller';
import { TeamUserService } from './teamUser.service';

@Module({
  imports: [TypeOrmModule.forFeature([TeamUser])],
  controllers: [TeamUserController],
  providers: [TeamUserService],
  exports: [TeamUserService],
})
export class TeamModule {}
