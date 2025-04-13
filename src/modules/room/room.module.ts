import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { Room } from './entities/room.entity';
import { RoomUser } from '../roomUser/entities/roomUser.entity';
import { RoomAuthModule } from '../roomAuth/roomAuth.module';
import { RoomUserModule } from '../roomUser/roomUser.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, RoomUser]),
    RoomAuthModule,
    RoomUserModule,
  ],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
