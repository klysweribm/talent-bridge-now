import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

const DEFAULT_PORT = 3000;
const DEFAULT_FRONTEND_URL = 'http://localhost:5173';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', DEFAULT_FRONTEND_URL),
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('IBM Talent Bridge API')
    .setDescription('Plataforma de coordinación de selección — IBM Consulting LatAm')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', DEFAULT_PORT);
  await app.listen(port);

  logger.log(`IBM Talent Bridge API corriendo en http://localhost:${port}/api/v1`);
  logger.log(`Swagger docs en http://localhost:${port}/api/docs`);
}

void bootstrap();
