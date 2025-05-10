import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomUser } from '../roomUser/entities/roomUser.entity';
import { RoomAuthService } from './roomAuth.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoomUser])],
  providers: [RoomAuthService],
  exports: [RoomAuthService],
})
export class RoomAuthModule {}
