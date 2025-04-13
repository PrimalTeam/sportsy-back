import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomUser } from './entities/roomUser.entity';
import { Repository } from 'typeorm';
import {
  CreateRoomUserDto,
  GenerateRoomUserDto,
} from './dto/createRoomUser.dto';

type RoomUserFindOptions = Pick<RoomUser, 'roomId' | 'userId'>;

@Injectable()
export class RoomUserService {
  constructor(
    @InjectRepository(RoomUser)
    private readonly roomUserRepository: Repository<RoomUser>,
  ) {}

  addRoomUser(roomUser: CreateRoomUserDto, userId: number) {
    const newRoomUser = this.roomUserRepository.create(roomUser);
    newRoomUser.userId = userId;
    return this.roomUserRepository.save(newRoomUser);
  }

  async changeRoomUserRole({
    roomId,
    userId,
    role,
  }: Required<GenerateRoomUserDto>): Promise<RoomUser> {
    await this.roomUserRepository.update(
      { roomId: roomId, userId: userId },
      { role: role },
    );
    return this.findByUserAndRoomId({ roomId, userId });
  }

  generateRoomUser(roomUser: GenerateRoomUserDto): RoomUser {
    return this.roomUserRepository.create(roomUser);
  }

  async deleteUserByFindFunc({
    findFunc,
    options,
  }: {
    findFunc(_: Partial<RoomUser>): Promise<RoomUser>;
    options: Partial<RoomUser>;
  }) {
    const roomUser = await findFunc(options);
    this.roomUserRepository.delete(roomUser);
  }

  deleteRoomUser({ roomId, userId }: RoomUserFindOptions) {
    this.roomUserRepository.delete({ userId: userId, roomId: roomId });
  }

  findByUserAndRoomId({
    roomId,
    userId,
  }: RoomUserFindOptions): Promise<RoomUser> {
    return this.roomUserRepository.findOne({
      where: { roomId: roomId, userId: userId },
    });
  }

  findByUserId(userId: number): Promise<RoomUser[]> {
    return this.roomUserRepository.find({
      where: { userId: userId },
    });
  }
}
