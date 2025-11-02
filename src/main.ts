import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sportsy API')
    .setDescription('Sportsy backend HTTP API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // keeps auth token across page reloads in Swagger UI
    },
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
