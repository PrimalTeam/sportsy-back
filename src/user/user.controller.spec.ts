import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserModule } from './user.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { AppModule } from '../app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userService: UserService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        // UserModule,
        // AuthModule,
        // TypeOrmModule.forRoot({
        //   type: 'postgres',
        //   host: 'localhost',
        //   port: 5432,
        //   username: 'sportsy',
        //   password: 'sportsy',
        //   database: 'sportsy',
        //   entities: [User],
        //   synchronize: true,
        //   dropSchema: true,
        // }),
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    userService = moduleFixture.get<UserService>(UserService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/user/profile/:username (GET)', () => {
    let testUser: Object;
    let token: string;

    beforeAll(async () => {
      testUser = await authService.register({
        username: 'testUser',
        email: 'test@example.com',
        password: 'testPassword',
      });

      const loginResponse = await authService.login({
        email: 'test@example.com',
        password: 'testPassword',
      });
      token = loginResponse.access_token;
    });

    it('powinien zwrócić dane profilowe użytkownika z tokenem JWT', async () => {
      
      const response = await request(app.getHttpServer())
        .get(`/user/profile/testUser`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('username', testUser["username"]);
      expect(response.body).toHaveProperty('email', testUser["email"]);
    });

    it('powinien zwrócić błąd 401 bez tokena JWT', async () => {
      await request(app.getHttpServer())
        .get(`/user/profile/${testUser["username"]}`)
        .expect(401);
    });

    it('powinien zwrócić błąd 404 dla nieistniejącego użytkownika', async () => {
      await request(app.getHttpServer())
        .get('/user/profile/nonExistingUser')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});