import { Test, TestingModule } from '@nestjs/testing';
import { Room } from './entities/room.entity';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { AccessTokenPayload } from '../auth/models/accessToken';
import { CreateRoomDto } from './dto/createRoom.dto';
import { RoomUserService } from '../roomUser/roomUser.service';
import { CanActivate, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtGuard } from 'src/guards/auth.guard';
import { RoomUser, RoomUserRole } from '../roomUser/entities/roomUser.entity';

describe('RoomController Test', () => {
  let moduleFixture: TestingModule;
  let roomController: RoomController;
  let app: INestApplication;

  const mockRoomService = {
    createRoom: jest.fn(),
    findRoomById: jest.fn(),
    deleteRoomById: jest.fn(),
    updateRoomById: jest.fn(),
  };

  const mockRoomUserService = {
    findByUserAndRoomId: jest.fn(),
  };

  beforeAll(async () => {
    const mockJwtGuard: CanActivate = {
      canActivate: jest.fn((exec) => {
        exec.switchToHttp().getRequest().user = { sub: 1 };
        return true;
      }),
    };
    moduleFixture = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: RoomUserService,
          useValue: mockRoomUserService,
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockJwtGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    roomController = moduleFixture.get<RoomController>(RoomController);
  });

  afterAll(async () => {
    await app.close();
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(roomController).toBeDefined();
  });

  it('test createRoom', async () => {
    const user: AccessTokenPayload = {
      sub: 1,
      email: 'test',
      exp: 1111,
      iat: 1111,
    };

    const roomData: CreateRoomDto = {
      name: 'test',
    };

    const room: Room = {
      id: 1,
      name: roomData.name,
      icon: null,
      roomUsers: [],
      tournament: null,
    };

    mockRoomUserService.findByUserAndRoomId.mockResolvedValue(null);
    mockRoomService.createRoom.mockResolvedValue(room);
    const result = await request(app.getHttpServer())
      .post('/room/create')
      .set('Authorization', `Bearer ${user.sub}`)
      .send(roomData);
    console.log(result.body);

    expect(result.body).toEqual(room);
  });

  it('test getRoom', async () => {
    const roomId = 1;

    const roomUser: Partial<RoomUser> = {
      id: 1,
      userId: 1,
      roomId: roomId,
      role: RoomUserRole.GAMEOBSERVER,
    };

    mockRoomUserService.findByUserAndRoomId.mockResolvedValue(roomUser);
    const result = await request(app.getHttpServer())
      .get(`/room/${roomId}`)
      .set('Authorization', `Bearer test`)
      .expect(403);
    console.log(result.body);
  });
});
