import { Test, TestingModule } from '@nestjs/testing';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { RoomModule } from './room.module';
import { User } from '../user/entities/user.entity';
import { Room } from './entities/room.entity';
import { RoomUser, RoomUserRole } from '../roomUser/entities/roomUser.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../user/dto/createUser.dto';
import { AccessTokenPayload } from '../auth/models/accessToken';
import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateRoomDto } from './dto/createRoom.dto';
import { after, before } from 'node:test';
import { UserService } from '../user/user.service';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { RoomService } from './room.service';
import { RoomUserService } from '../roomUser/roomUser.service';

const pgConfig = {
  POSTGRES_USER: 'sportsy',
  POSTGRES_PASSWORD: 'sportsy',
  POSTGRES_DB: 'sportsy',
};
let pgContainer: StartedTestContainer;

describe('Room Module Test (e2e)', () => {
  jest.setTimeout(30000); // Set timeout to 30 seconds

  let moduleFixture: TestingModule;
  let app: INestApplication;
  let roomRepository: Repository<Room>;
  let roomUserRepository: Repository<RoomUser>;
  let roomService: RoomService;
  let roomUserService: RoomUserService;

  const userCreateData: CreateUserDto[] = [
    {
      email: 'testEmail1',
      password: 'testPassword1',
      username: 'testUsername1',
    },
    {
      email: 'testEmail2',
      password: 'testPassword1',
      username: 'testUsername2',
    },
    {
      email: 'testEmail3',
      password: 'testPassword1',
      username: 'testUsername3',
    },
  ];

  type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
  }[keyof T];
  type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;
  type TestUser = NonFunctionProperties<
    User & { access_token: string; refresh_token: string }
  >;

  const userData: TestUser[] = [];

  beforeAll(async () => {
    pgContainer = await new GenericContainer('postgres')
      .withEnvironment(pgConfig)
      .withExposedPorts(5432)
      .start();

    const host = pgContainer.getHost();
    const port = pgContainer.getMappedPort(5432);

    moduleFixture = await Test.createTestingModule({
      imports: [
        RoomModule,
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: host,
          port: port,
          username: pgConfig.POSTGRES_USER,
          password: pgConfig.POSTGRES_PASSWORD,
          database: pgConfig.POSTGRES_DB,
          entities: [Room, RoomUser, User],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([Room, RoomUser, User]),
        AuthModule,
      ],
      providers: [UserService, JwtStrategy],
    }).compile();

    const userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    roomRepository = moduleFixture.get<Repository<Room>>(
      getRepositoryToken(Room),
    );
    roomUserRepository = moduleFixture.get<Repository<RoomUser>>(
      getRepositoryToken(RoomUser),
    );

    const authService = moduleFixture.get<AuthService>(AuthService);
    roomService = moduleFixture.get<RoomService>(RoomService);
    roomUserService = moduleFixture.get<RoomUserService>(RoomUserService);

    await Promise.all(
      userCreateData.map(async (userCreat) => {
        await authService.register(userCreat);
        const user = await userRepository.findOneBy({
          email: userCreat.email,
        });
        const tokens = await authService.generateLoginResponse(user);
        userData.push({
          ...user,
          ...tokens,
        });
      }),
    );

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await moduleFixture.close();
    await pgContainer.stop();
  });

  describe('POST /room/create', () => {
    afterAll(async () => {
      await roomRepository.delete({});
    });

    it('should create a room', async () => {
      const roomData: CreateRoomDto = {
        name: 'testRoom',
      };
      const user = userData[0];
      const result = await request(app.getHttpServer())
        .post('/room/create')
        .set('Authorization', `Bearer ${user.access_token}`)
        .send(roomData);
      const body = result.body as Room;

      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.body).toMatchObject<CreateRoomDto>(roomData);
      expect(body.roomUsers.length).toBe(1);
      expect(body.roomUsers[0].userId).toBe(user.id);
      expect(body.roomUsers[0].role).toBe(RoomUserRole.ADMIN);
    });

    it('shouldnt pass without valid token', async () => {
      const roomData: CreateRoomDto = {
        name: 'testRoom',
      };
      const result = await request(app.getHttpServer())
        .post('/room/create')
        .set('Authorization', `Bearer invalidToken`)
        .send(roomData);
      expect(result.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should pass without room name', async () => {
      const roomData: CreateRoomDto = {
        name: '',
      };
      const user = userData[0];
      const result = await request(app.getHttpServer())
        .post('/room/create')
        .set('Authorization', `Bearer ${user.access_token}`)
        .send(roomData);
      expect(result.status).toBe(HttpStatus.CREATED);
    });
  });

  describe('DELETE /room/:roomId', () => {
    const roomData: CreateRoomDto = {
      name: 'testRoom',
    };
    let adminUser: TestUser;
    let nonAdminUser: TestUser;
    let nonMemberUser: TestUser;
    let roomId: number;

    beforeEach(async () => {
      adminUser = userData[0];
      nonAdminUser = userData[1];
      nonMemberUser = userData[2];

      const response = await request(app.getHttpServer())
        .post('/room/create')
        .set('Authorization', `Bearer ${adminUser.access_token}`)
        .send(roomData);
      roomId = (response.body as Room).id;

      await roomUserService.addRoomUser(
        { role: RoomUserRole.SPECTRATOR, roomId: roomId },
        nonAdminUser.id,
      );
    });

    afterEach(async () => {
      await roomRepository.delete({});
    });

    it('should delete a room', async () => {
      const adminUserToken = adminUser.access_token;

      const response = await request(app.getHttpServer())
        .delete(`/room/${roomId}`)
        .set('Authorization', `Bearer ${adminUserToken}`);
      expect(response.status).toBe(HttpStatus.OK);
      const room = await roomRepository.findOne({
        where: { id: roomId },
      });
      expect(room).toBeNull();
      const roomUsers = await roomUserRepository.find({
        where: { roomId: roomId },
      });
      expect(roomUsers.length).toBe(0);
    });

    it('should not allow non-admin user to delete a room', async () => {
      const nonAdminUserToken = nonAdminUser.access_token;

      const response = await request(app.getHttpServer())
        .delete(`/room/${roomId}`)
        .set('Authorization', `Bearer ${nonAdminUserToken}`);
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should not allow non-member user to delete a room', async () => {
      const nonMemberUserToken = nonMemberUser.access_token;

      const response = await request(app.getHttpServer())
        .delete(`/room/${roomId}`)
        .set('Authorization', `Bearer ${nonMemberUserToken}`);
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should return 403 for non-existing room', async () => {
      const adminUserToken = adminUser.access_token;
      const nonExistingRoomId = 9999;

      const response = await request(app.getHttpServer())
        .delete(`/room/${nonExistingRoomId}`)
        .set('Authorization', `Bearer ${adminUserToken}`);
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });
  });

  describe('GET /room/:roomId', () => {
    const roomData: CreateRoomDto = {
      name: 'testRoom',
    };
    let adminUser: TestUser;
    let nonAdminUser: TestUser;
    let nonMemberUser: TestUser;
    let roomId: number;

    beforeAll(async () => {
      adminUser = userData[0];
      nonAdminUser = userData[1];
      nonMemberUser = userData[2];

      const response = await request(app.getHttpServer())
        .post('/room/create')
        .set('Authorization', `Bearer ${adminUser.access_token}`)
        .send(roomData);
      roomId = (response.body as Room).id;

      await roomUserService.addRoomUser(
        { role: RoomUserRole.SPECTRATOR, roomId: roomId },
        nonAdminUser.id,
      );
    });

    afterAll(async () => {
      await roomRepository.delete({});
    });

    it('should get room details for admin user', async () => {
      const adminUserToken = adminUser.access_token;

      const response = await request(app.getHttpServer())
        .get(`/room/${roomId}`)
        .set('Authorization', `Bearer ${adminUserToken}`);
      expect(response.status).toBe(HttpStatus.OK);
      const room = response.body as Room;
      expect(room.id).toBe(roomId);
    });

    it('should get room details for non-admin user', async () => {
      const nonAdminUserToken = nonAdminUser.access_token;

      const response = await request(app.getHttpServer())
        .get(`/room/${roomId}`)
        .set('Authorization', `Bearer ${nonAdminUserToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      const room = response.body as Room;
      expect(room.id).toBe(roomId);
    });

    it('should not allow non-member user to get room details', async () => {
      const nonMemberUserToken = nonMemberUser.access_token;

      const response = await request(app.getHttpServer())
        .get(`/room/${roomId}`)
        .set('Authorization', `Bearer ${nonMemberUserToken}`);
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should return 403 for non-existing room', async () => {
      const adminUserToken = adminUser.access_token;
      const nonExistingRoomId = 9999;

      const response = await request(app.getHttpServer())
        .get(`/room/${nonExistingRoomId}`)
        .set('Authorization', `Bearer ${adminUserToken}`);
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });
  });
});
