import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true, // Enables automatic transformation of plain objects to class instances
  //     whitelist: true, // Strips properties not defined in the DTO
  //     forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are present
  //   }),
  // );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
