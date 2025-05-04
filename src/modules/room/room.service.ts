import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto/createRoom.dto';
import { RoomUserService } from '../roomUser/roomUser.service';
import { RoomUserRole } from '../roomUser/entities/roomUser.entity';
import { User, UserIdentifierType } from '../user/entities/user.entity';
import { TournamentService } from '../tournament/tournament.service';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    private readonly roomUserService: RoomUserService,
    private readonly tournamentService: TournamentService,
  ) {}

  async createRoom(
    createRoomDto: CreateRoomDto,
    userId: number,
  ): Promise<Room> {
    const {roomUsers, tournament, ...roomDto } = createRoomDto
    const room = this.roomRepository.create({...roomDto});
    if (roomUsers && roomUsers.length > 0) {
      const newRoomUsers = await this.roomUserService.generateRoomUserList(roomUsers); 
      if (roomUsers.some((roomUser)=> roomUser === null)) 
        throw new HttpException('User for adding to the room not found', HttpStatus.BAD_REQUEST);
      else
        room.roomUsers.push(...newRoomUsers);
    }
    if (tournament) {
      const newTournament = await this.tournamentService.generateTournament({
        ...tournament,
      })
      room.tournament = newTournament;
    }
    const roomUser = await this.roomUserService.generateRoomUser({
      role: RoomUserRole.ADMIN,
      identifier: userId.toString(),
      identifierType: UserIdentifierType.ID,
    });
    room.roomUsers.push(roomUser);
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
