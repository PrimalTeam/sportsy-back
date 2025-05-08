import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto/createRoom.dto';
import { RoomUserService } from '../roomUser/roomUser.service';
import { RoomUser, RoomUserRole } from '../roomUser/entities/roomUser.entity';
import { UserIdentifierType } from '../user/entities/user.entity';
import { TournamentService } from '../tournament/tournament.service';
import { TypeOrmUtils } from 'src/utils/typeorm-utils';

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

  findRoomById(roomId: number): Promise<Room> {
    return this.roomRepository.findOne({
      where: { id: roomId },
    });
  }

  async findRoomByIdWithRelations(
    roomId: number,
    includes: string[] = [],
  ): Promise<Room | null> {
    return TypeOrmUtils.getEntityWithRelations(
      Room,
      this.roomRepository,
      roomId,
      includes,
    );
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
    this.checkRoomExistence(roomId);
    return this.roomRepository.delete({ id: roomId });
  }

  async updateRoomById(
    roomId: number,
    roomData: Partial<CreateRoomDto>,
  ): Promise<Room> {
    this.checkRoomExistence(roomId);
    await this.roomRepository.update({ id: roomId }, roomData);
    return this.findRoomById(roomId);
  }

  async getUserRooms(userId: number): Promise<Room[] | null> {
    const rooms = await this.roomRepository.find({
      where: { roomUsers: { userId: userId } },
    });
    this.verifyRoomFind(rooms);
    return rooms;
  }

  async getUsersOfRoom(roomId: number): Promise<RoomUser[] | null> {
    const room = await this.findRoomByIdWithRelations(roomId, [
      'roomUsers.user',
      'tournament.room',
    ]);
    this.verifyRoomFind(room);
    return room.roomUsers;
    // return room?.roomUsers.map((roomUser) => {
    //   const { password, ...user } = roomUser.user;
    //   return { ...user, role: roomUser.role };
    // });
  }

  verifyRoomFind(room: Room | null | Room[]): void {
    if (!room) {
      throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
    }
  }

  async checkRoomExistence(roomId: number): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id: roomId } });
    this.verifyRoomFind(room);
    return room;
  }
}
