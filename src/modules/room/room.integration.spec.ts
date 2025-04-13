import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { RoomService } from './room.service';
import { RoomUserService } from '../roomUser/roomUser.service';
import { Connection, Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { RoomUser, RoomUserRole } from '../roomUser/entities/roomUser.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { after } from 'node:test';
import { CreateRoomDto } from './dto/createRoom.dto';
import { CreateRoomUserDto } from '../roomUser/dto/createRoomUser.dto';
import { User } from '../user/entities/user.entity';

let pgContainer: StartedTestContainer;
let connection: Connection;

describe('Room Services Integration Test', () => {
  let roomService: RoomService;
  let roomUserService: RoomUserService;
  let roomRepository: Repository<Room>;
  let moduleFixture: TestingModule;
  let roomUserRepository: Repository<RoomUser>;

  jest.setTimeout(30000); // Set timeout to 30 seconds

  beforeAll(async () => {
    pgContainer = await new GenericContainer('postgres')
      .withEnvironment({
        POSTGRES_USER: 'sportsy',
        POSTGRES_PASSWORD: 'sportsy',
        POSTGRES_DB: 'sportsy',
      })
      .withExposedPorts(5432)
      .start();
    const port = pgContainer.getMappedPort(5432);
    const host = pgContainer.getHost();
    console.log('Host:', host);

    moduleFixture = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: host,
          port: port,
          username: 'sportsy',
          password: 'sportsy',
          database: 'sportsy',
          entities: [Room, RoomUser, User],
          dropSchema: true,
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Room, RoomUser, User]),
      ],
      providers: [RoomService, RoomUserService],
    }).compile();

    roomService = moduleFixture.get<RoomService>(RoomService);
    roomUserService = moduleFixture.get<RoomUserService>(RoomUserService);
    roomRepository = moduleFixture.get<Repository<Room>>(
      getRepositoryToken(Room),
    );
    roomUserRepository = moduleFixture.get<Repository<RoomUser>>(
      getRepositoryToken(RoomUser),
    );
    const userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    await userRepository.save({
      email: 'testEmail',
      username: 'testUsername',
      password: 'testPassword',
    });

    await userRepository.save({
      email: 'testEmail1',
      username: 'testUsername1',
      password: 'testPassword',
    });
  });

  afterAll(async () => {
    console.log(await roomRepository.find());
    console.log(await roomUserRepository.find());
    await pgContainer.stop();
    await moduleFixture.close();
  });

  afterEach(async () => {
    await roomRepository.delete({});
  });

  describe('Room life cycle', () => {
    let roomCreated: Room;

    beforeEach(async () => {
      const roomData: CreateRoomDto = {
        name: 'Test Room',
      };
      roomCreated = await roomService.createRoom(roomData, 1);
    });

    afterEach(async () => {
      await roomRepository.delete({});
    });

    it('should find an existing room', async () => {
      const room = await roomService.findRoomById(roomCreated.id);
      console.log(room);
      expect(room).toBeDefined();
      expect(room.id).toBe(roomCreated.id);
      expect(room.name).toBe(roomCreated.name);

      const populatedRoom = await roomRepository.findOne({
        where: { id: roomCreated.id },
        relations: ['roomUsers'],
      });
      expect(populatedRoom.roomUsers).toBeDefined();
      expect(populatedRoom.roomUsers.length).toBe(1);
      expect(populatedRoom.roomUsers[0].role).toBe(RoomUserRole.ADMIN);
      expect(populatedRoom.roomUsers[0].userId).toBe(1);
    });

    it('should delete a room', async () => {
      await roomService.deleteRoomById(roomCreated.id);

      const room = await roomService.findRoomById(roomCreated.id);

      expect(room).toBeNull();

      const roomUsers = await roomUserRepository.find({
        where: { roomId: roomCreated.id },
      });
      expect(roomUsers.length).toBe(0);
    });

    it('should update a room', async () => {
      const roomNewData: CreateRoomDto = {
        name: 'Updated Room',
      };

      const updatedRoom = await roomService.updateRoomById(
        roomCreated.id,
        roomNewData,
      );

      expect(updatedRoom).toBeDefined();
      expect(updatedRoom.id).toBe(roomCreated.id);
      expect(updatedRoom.name).toBe(roomNewData.name);

      const populatedRoom = await roomRepository.findOne({
        where: { id: roomCreated.id },
        relations: ['roomUsers'],
      });
      expect(populatedRoom.roomUsers.length).toBe(1);
      expect(populatedRoom.roomUsers[0].role).toBe(RoomUserRole.ADMIN);
      expect(populatedRoom.roomUsers[0].userId).toBe(1);
    });

    it('should add a user to the room', async () => {
      const roomUser: CreateRoomUserDto = {
        userId: 2,
        role: RoomUserRole.SPECTRATOR,
      };

      const roomUserCreated = await roomUserService.addRoomUser(
        roomUser,
        roomCreated.id,
      );

      expect(roomUserCreated).toBeDefined();
      expect(roomUserCreated.id).toBeDefined();
      expect(roomUserCreated.roomId).toBe(roomCreated.id);
      expect(roomUserCreated.userId).toBe(2);
      expect(roomUserCreated.role).toBe(RoomUserRole.SPECTRATOR);

      //   const room = await roomService.findRoomById(roomCreated.id);
      const populatedRoom = await roomRepository.findOne({
        where: { id: roomCreated.id },
        relations: ['roomUsers'],
      });
      expect(populatedRoom.roomUsers.length).toBe(2);
      expect(populatedRoom.roomUsers[1].role).toBe(RoomUserRole.SPECTRATOR);
      expect(populatedRoom.roomUsers[1].userId).toBe(2);
    });
  });

  it('should create a new room', async () => {
    const roomData: CreateRoomDto = {
      name: 'Test Room',
    };
    const newRoom = await roomService.createRoom(roomData, 1);

    expect(newRoom).toHaveProperty('id');
    expect(newRoom.name).toBe(roomData.name);
  });
});
