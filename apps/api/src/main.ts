import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable global validation with class-validator
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Set global prefix to /api
  app.setGlobalPrefix('api');

  // Enable CORS explicitly for production and local environments
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://afin-seven.vercel.app',
      // Allow preview deployments if any:
      /\.vercel\.app$/
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend server successfully started on port ${port}`);
}
bootstrap();
