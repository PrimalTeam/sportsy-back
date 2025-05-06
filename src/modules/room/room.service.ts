import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { getMetadataArgsStorage, Repository } from 'typeorm';
import { CreateRoomDto } from './dto/createRoom.dto';
import { RoomUserService } from '../roomUser/roomUser.service';
import { RoomUserRole } from '../roomUser/entities/roomUser.entity';
import { User, UserIdentifierType } from '../user/entities/user.entity';
import { TournamentService } from '../tournament/tournament.service';
import { GenerateTournamentDto } from '../tournament/dto/createTournament.dto';

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
      if (roomUsers.some((roomUser) => roomUser === null))
        throw new HttpException(
          'User for adding to the room not found',
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

  findRoomByIdWithRelations(
    roomId: number,
    includes: string[] = [],
  ): Promise<Room> {
    const validFields = getMetadataArgsStorage()
      .relations.filter((column) => column.target == Room)
      .map((column) => column.propertyName);
    const selectedIncludes = includes.filter((include) =>
      validFields.includes(include),
    );

    return this.roomRepository.findOne({
      where: { id: roomId },
      relations: selectedIncludes.length > 0 ? selectedIncludes : undefined,
    });
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
