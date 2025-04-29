import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomUser } from './entities/roomUser.entity';
import { RoomUserService } from './roomUser.service';
import { RoomUserController } from './roomUser.controller';
import { RoomAuthModule } from '../roomAuth/roomAuth.module';

@Module({
  imports: [TypeOrmModule.forFeature([RoomUser]), RoomAuthModule],
  controllers: [RoomUserController],
  providers: [RoomUserService],
  exports: [RoomUserService],
})
export class RoomUserModule {}
