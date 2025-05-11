import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto/createRoom.dto';
import { RoomUserService } from '../roomUser/roomUser.service';
import { RoomUser, RoomUserRole } from '../roomUser/entities/roomUser.entity';
import { UserIdentifierType } from '../user/entities/user.entity';
import { TournamentService } from '../tournament/tournament.service';
import { BaseService } from 'src/interfaces/baseService';
import { UpdateRoomDto } from './dto/updateRoom.dto';

@Injectable()
export class RoomService extends BaseService<Room> {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    private readonly roomUserService: RoomUserService,
    private readonly tournamentService: TournamentService,
  ) {
    super(roomRepository, Room);
  }

  async createRoom(
    createRoomDto: CreateRoomDto,
    userId: number,
  ): Promise<Room> {
    const { roomUsers, tournament, ...roomDto } = createRoomDto;
    const room = this.roomRepository.create({ ...roomDto });
    room.roomUsers = room.roomUsers || [];
    if (roomUsers && roomUsers.length > 0) {
      const newRoomUsers =
        await this.roomUserService.generateRoomUserList(roomUsers);
      if (newRoomUsers.some((roomUser) => roomUser === null))
        throw new HttpException(
          {
            message: 'User for adding to the room not found',
            roomUser: roomUsers.filter((_, ind) => newRoomUsers[ind] === null),
          },
          HttpStatus.BAD_REQUEST,
        );
      else room.roomUsers.push(...newRoomUsers);
    }
    if (tournament) {
      const newTournament = await this.tournamentService.generateTournament({
        ...tournament,
      });
      room.tournament = newTournament;
    } else {
      const newTournament =
        await this.tournamentService.generateDefaultTournament();
      room.tournament = newTournament;
    }
    const creatorUser = await this.roomUserService.generateRoomUser({
      role: RoomUserRole.ADMIN,
      identifier: userId.toString(),
      identifierType: UserIdentifierType.ID,
    });
    room.roomUsers.push(creatorUser);
    return await this.roomRepository.save(room);
  }

  //Not used
  getFullRoomById(roomId: number): Promise<Room | null> {
    return this.roomRepository.findOne({
      where: { id: roomId },
      relations: {
        roomUsers: { user: true },
      },
    });
  }

  deleteRoomById(roomId: number) {
    this.checkEntityExistenceById(roomId);
    return this.roomRepository.delete({ id: roomId });
  }

  async updateRoomById(roomId: number, roomData: UpdateRoomDto): Promise<Room> {
    this.checkEntityExistenceById(roomId);
    await this.roomRepository.update({ id: roomId }, roomData);
    return this.findById(roomId);
  }

  async getUserRooms(userId: number): Promise<Room[] | null> {
    const rooms = await this.roomRepository.find({
      where: { roomUsers: { userId: userId } },
    });
    this.verifyEntityFind(rooms);
    return rooms;
  }

  async getUsersOfRoom(roomId: number): Promise<RoomUser[] | null> {
    const room = await this.findByIdWithRelations(roomId, [
      'roomUsers.user',
      'tournament.room',
    ]);
    this.verifyEntityFind(room);
    return room.roomUsers;
    // return room?.roomUsers.map((roomUser) => {
    //   const { password, ...user } = roomUser.user;
    //   return { ...user, role: roomUser.role };
    // });
  }
}
