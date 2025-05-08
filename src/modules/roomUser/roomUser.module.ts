import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomUser } from './entities/roomUser.entity';
import { RoomUserService } from './roomUser.service';
import { RoomUserController } from './roomUser.controller';
import { RoomAuthModule } from '../roomAuth/roomAuth.module';
import { ProvidersNames } from '../custom-providers';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([RoomUser]), RoomAuthModule, UserModule],
  controllers: [RoomUserController],
  providers: [
    RoomUserService,
    { provide: ProvidersNames.USER_LOOKUP_SERVICE, useExisting: UserService },
  ],
  exports: [RoomUserService],
})
export class RoomUserModule {}
