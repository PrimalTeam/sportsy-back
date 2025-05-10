// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import * as request from 'supertest';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { AuthModule } from './auth.module';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from '../user/entities/user.entity';
// import { UserModule } from '../user/user.module';
// import { JwtModule } from '@nestjs/jwt';
// import { registerAs } from '@nestjs/config';
// import { AppModule } from '../app.module';

describe('AuthController ', () => {
  // let app: INestApplication;
  // beforeAll(async () => {
  //   const moduleFixture: TestingModule = await Test.createTestingModule({
  //     imports: [
  //       AppModule,
  //       // AuthModule,
  //       // UserModule,
  //       // TypeOrmModule.forRoot({
  //       //   type: 'postgres',
  //       //   host: 'localhost',
  //       //   port: 5432,
  //       //   username: 'sportsy',
  //       //   password: 'sportsy',
  //       //   database: 'sportsy',
  //       //   entities: [User],
  //       //   synchronize: true,
  //       //   dropSchema: true,
  //       // }),
  //     ],
  //     //controllers: [AuthController],
  //   }).compile();
  //   app = moduleFixture.createNestApplication();
  //   await app.init();
  // });
  // afterAll(async () => {
  //   await app.close();
  // });
  // describe('/auth/login (POST)', () => {
  //   beforeEach(async () => {
  //     try {
  //       let authService: AuthService;
  //       authService = app.get<AuthService>(AuthService);
  //       const registerDto = { email: 'testUser@wp.pl', username: "testUser", password: 'testPass' };
  //       await authService.register(registerDto);
  //     } catch (error) { }
  //   });
  //   it('powinien zwrócić token JWT po poprawnym zalogowaniu', async () => {
  //     const loginDto = { email: 'testUser@wp.pl', password: 'testPass' };
  //     const response = await request(app.getHttpServer())
  //       .post('/auth/login')
  //       .send(loginDto)
  //       .expect(201);
  //     expect(response.body).toHaveProperty('access_token');
  //     expect(typeof response.body.access_token).toBe('string');
  //   });
  //   it('powinien zwrócić błąd 401 dla niepoprawnych danych logowania', async () => {
  //     const loginDto = { email: 'invalidUser@wp.pl', password: 'invalidPassword' };
  //     await request(app.getHttpServer())
  //       .post('/auth/login')
  //       .send(loginDto)
  //       .expect(401);
  //   });
  // });
  // describe('/auth/register (POST)', () => {
  //   it('powinien zarejestrować nowego użytkownika', async () => {
  //     const registerDto = {
  //       username: 'newUser',
  //       email: 'new@user.com',
  //       password: 'newPassword'
  //     };
  //     const response = await request(app.getHttpServer())
  //       .post('/auth/register')
  //       .send(registerDto)
  //       .expect(201);
  //     expect(response.body).toHaveProperty('id');
  //     expect(response.body).toHaveProperty('success');
  //     expect(response.body.success).toBe('true');
  //   });
  //   it('powinien zwrócić błąd 400, jeśli użytkownik o danej nazwie już istnieje', async () => {
  //     const registerDto = {
  //       username: 'newUser',
  //       email: 'new@user.com',
  //       password: 'anotherPassword'
  //     };
  //     await request(app.getHttpServer())
  //       .post('/auth/register')
  //       .send(registerDto)
  //       .expect(400);
  //   });
  // });
  // describe('/auth/logout (POST)', () => {
  //   it('powinien wylogować użytkownika (jeśli logout coś zwraca)', async () => {
  //     const response = await request(app.getHttpServer())
  //       .post('/auth/logout')
  //       .expect(201);
  //     expect(response.body).toBeDefined();
  //   });
  // });
});
