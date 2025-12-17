import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
dotenv.config(); // Load manual sebelum NestFactory.create()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:8081', // Ganti dengan URL frontend kamu
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  
  await app.listen(3000);
}
bootstrap();
