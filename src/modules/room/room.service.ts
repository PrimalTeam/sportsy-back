import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto/createRoom.dto';
import { RoomUserService } from '../roomUser/roomUser.service';
import { RoomUserRole } from '../roomUser/entities/roomUser.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    private readonly roomUserService: RoomUserService,
  ) {}

  async createRoom(
    createRoomDto: CreateRoomDto,
    userId: number,
  ): Promise<Room> {
    const room = this.roomRepository.create(createRoomDto);
    const roomUser = this.roomUserService.generateRoomUser({
      role: RoomUserRole.ADMIN,
      userId: userId,
    });
    room.roomUsers = [roomUser];
    return await this.roomRepository.save(room);
  }

  findRoomById(roomId: number): Promise<Room> {
    return this.roomRepository.findOne({ where: { id: roomId } });
  }

  getFullRoomById(roomId: number): Promise<Room | null> {
    return this.roomRepository.findOne({
      where: { id: roomId },
      relations: {
        roomUsers: { user: true },
      },
    });
  }

  deleteRoomById(roomId: number) {
    return this.roomRepository.delete({ id: roomId });
  }

  async updateRoomById(roomId: number, roomData: Partial<CreateRoomDto>) {
    await this.roomRepository.update({ id: roomId }, roomData);
    return this.findRoomById(roomId);
  }

  async getUserRooms(userId: number): Promise<Room[] | null> {
    const rooms = await this.roomRepository.find({
      where: { roomUsers: { userId: userId } },
    });
    return rooms;
  }

  async getUsersOfRoom(roomId: number): Promise<User[] | null> {
    const room = await this.getFullRoomById(roomId);
    return room?.roomUsers.map((roomUser) => roomUser.user);
  }
}
