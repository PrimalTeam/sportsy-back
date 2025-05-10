import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';

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
export class UserService {
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
