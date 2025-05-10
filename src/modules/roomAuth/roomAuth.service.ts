import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomUser, RoomUserRole } from '../roomUser/entities/roomUser.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoomAuthService {
  constructor(
    @InjectRepository(RoomUser)
    private readonly roomUserRepository: Repository<RoomUser>,
  ) {}

  async isUserInRoom(userId: number, roomId: number): Promise<boolean> {
    const roomUser = await this.roomUserRepository.findOne({
      where: { userId, roomId },
    });
    return !!roomUser;
  }

  async getUserRoleInRoom(
    userId: number,
    roomId: number,
  ): Promise<RoomUserRole | null> {
    const roomUser = await this.roomUserRepository.findOne({
      where: { userId, roomId },
    });
    return roomUser?.role ?? null;
  }
}
