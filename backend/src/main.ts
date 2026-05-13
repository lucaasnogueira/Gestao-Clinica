import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  // ── Segurança ─────────────────────────────────────────────────────
  app.use(helmet());
  app.use(compression());

  // ── CORS ──────────────────────────────────────────────────────────
  const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['http://localhost:3000'];

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ── Validação Global ──────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Prefixo Global da API ─────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Swagger / OpenAPI ─────────────────────────────────────────────
  const isProduction = process.env.NODE_ENV === 'production';
  const showSwagger = process.env.SHOW_SWAGGER === 'true' || !isProduction;

  if (showSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Clinic Management API')
      .setDescription('Sistema de Gerenciamento de Clínicas - Documentação da API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Autenticação e autorização')
      .addTag('patients', 'Gestão de pacientes')
      .addTag('doctors', 'Gestão de médicos')
      .addTag('appointments', 'Agendamentos')
      .addTag('medical-records', 'Prontuários eletrônicos')
      .addTag('billing', 'Faturamento')
      .addTag('insurance', 'Convênios')
      .addTag('specialties', 'Especialidades')
      .addTag('reports', 'Relatórios')
      .addTag('notifications', 'Notificações')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = process.env.PORT || process.env.APP_PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`\n🏥  Clinic API iniciada na porta: ${port}`);
  console.log(`🚀  Ambiente: ${process.env.NODE_ENV || 'development'}`);
  if (showSwagger) {
    console.log(`📚  Swagger docs disponível em: /api/docs\n`);
  }
}

bootstrap();
