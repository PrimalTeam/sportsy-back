import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomUser, RoomUserRole } from './entities/roomUser.entity';
import { Repository } from 'typeorm';
import { CreateRoomUserDto, GenerateRoomUserDto } from './dto/createRoomUser.dto';
import { UserLookupService } from '../user/interfaces/userService.interface';
import { ProvidersNames } from '../custom-providers';
import { UserIdentifierType } from '../user/entities/user.entity';

type RoomUserFindOptions = Pick<RoomUser, 'roomId' | 'userId'>;

@Injectable()
export class RoomUserService {
  constructor(
    @InjectRepository(RoomUser)
    private readonly roomUserRepository: Repository<RoomUser>,
    @Inject(ProvidersNames.USER_LOOKUP_SERVICE)
    private readonly userLookupService: UserLookupService,
  ) {}

  async getValidatedUserId(identifier: string, identifierType: UserIdentifierType): Promise<number> {
    const userId = await this.userLookupService.getUserIdByIdentifier(identifier, identifierType);
    if (!userId) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return userId;
  }

  async addRoomUser(roomUserDto: CreateRoomUserDto, roomId: number) {
    const { identifier, identifierType, role } = roomUserDto;
    const userId = await this.getValidatedUserId(identifier, identifierType);
    const newRoomUser = this.roomUserRepository.create({
      userId,
      role,
      roomId,
    });
    return this.roomUserRepository.save(newRoomUser);
  }

  async changeRoomUserRole({
    roomId,
    identifier,
    identifierType,
    role,
  }: Required<GenerateRoomUserDto>): Promise<RoomUser> {
    const userId = await this.getValidatedUserId(identifier, identifierType);
    await this.roomUserRepository.update({ roomId: roomId, userId: userId }, { role: role });
    return this.findByUserAndRoomId({ roomId, userId });
  }

  async generateRoomUser(roomUser: GenerateRoomUserDto): Promise<RoomUser> {
    const { identifier, identifierType, role, roomId } = roomUser;
    const userId = await this.getValidatedUserId(identifier, identifierType);
    return this.roomUserRepository.create({ userId, role, roomId });
  }

  async generateRoomUserList(
    createRoomUserDtos: CreateRoomUserDto[],
    roomId?: number,
  ): Promise<(RoomUser | null)[]> {
    const roomUsers = await Promise.all(
      createRoomUserDtos.map(async (createRoomUser) => {
        const { identifier, identifierType } = createRoomUser;
        const userId = await this.userLookupService.getUserIdByIdentifier(identifier, identifierType);
        if (!userId) {
          return null;
        }
        return this.roomUserRepository.create({
          userId: userId,
          role: createRoomUser.role,
          roomId: roomId,
        });
      }),
    );
    return roomUsers;
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

  findByUserAndRoomId({ roomId, userId }: RoomUserFindOptions): Promise<RoomUser> {
    return this.roomUserRepository.findOne({
      where: { roomId: roomId, userId: userId },
    });
  }

  findByUserId(userId: number): Promise<RoomUser[]> {
    return this.roomUserRepository.find({
      where: { userId: userId },
    });
  }

  getRoomUserRoles() {
    return Object.values(RoomUserRole);
  }
}
