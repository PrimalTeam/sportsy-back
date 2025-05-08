import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserIdentifierType } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { Room } from '../room/entities/room.entity';
import { RoomUserRole } from '../roomUser/entities/roomUser.entity';
import { UserLookupService } from './interfaces/userService.interface';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UserCredentials = {
  email: string;
  password: string;
};

type UserUniqueData = {
  email: string;
  username: string;
};

@Injectable()
export class UserService implements UserLookupService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { username } });
  }

  async findOne(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async getUserIdByIdentifier(
    identifier: string,
    identifierType: UserIdentifierType,
  ): Promise<number> {
    let user: User | null = null;
    switch (identifierType) {
      case UserIdentifierType.ID: {
        const userId = Number(identifier);
        if (isNaN(userId)) {
          return null;
        }
        return userId;
      }
      case UserIdentifierType.EMAIL:
        user = await this.findByEmail(identifier);
        break;
      case UserIdentifierType.USERNAME:
        user = await this.findByUsername(identifier);
        break;
      default:
        throw new HttpException(
          'Invalid identifier type',
          HttpStatus.BAD_REQUEST,
        );
    }
    if (!user) {
      return null;
    }
    return user.id;
  }

  async getUserRooms(id: number): Promise<(Room & { role: RoomUserRole })[]> {
    const user = await this.getUserWithRooms(id);
    return user.roomUsers.map((roomUser) => ({
      ...roomUser.room,
      role: roomUser.role,
    }));
  }

  async getUserWithRooms(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { roomUsers: { room: true } },
    });
    if (!user) {
      throw new HttpException(
        `User with id ${id} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }

  async validateUserExistence(
    credentials: Partial<UserUniqueData>,
  ): Promise<boolean> {
    if (!credentials.email && !credentials.username) {
      throw new HttpException(
        'Email or username must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.usersRepository.findOne({
      where: [
        credentials.email ? { email: credentials.email } : {},
        credentials.username ? { username: credentials.username } : {},
      ],
    });
    return !!user;
  }
}
