import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // ¡Importante!

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ¡ESTA ES LA LÍNEA MÁGICA QUE BLINDA TU API!
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Borra campos extra que no están en el DTO
      forbidNonWhitelisted: true, // Tira error si alguien manda basura extra
      transform: true, // Transforma los datos de entrada al tipo del DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
