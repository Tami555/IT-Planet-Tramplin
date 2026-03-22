import {NestFactory} from '@nestjs/core';
import {ValidationPipe, Logger} from '@nestjs/common';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';
import {ConfigService} from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import {AppModule} from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['log', 'error', 'warn', 'debug'],
    });

    const config = app.get(ConfigService);
    const port = config.get<number>('PORT', 3000);

    app.use(cookieParser());

    app.enableCors({
        origin: config.get('CORS_ORIGIN', '*'),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {enableImplicitConversion: true},
            stopAtFirstError: false,
        }),
    );

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Трамплин API')
        .setDescription(
            `
## Платформа «Трамплин» — карьерная экосистема для студентов

### Аутентификация
Получите токен через \`POST /auth/login\`, нажмите **Authorize** (кнопка вверху справа) и введите:
\`\`\`
Bearer <ваш_accessToken>
\`\`\`

### Токены
- **Access-токен** — живёт **15 минут**
- **Refresh-токен** — живёт **7 дней**, обновляется через \`POST /auth/refresh\`

### Учётные данные администратора по умолчанию
\`\`\`
Email:    admin@tramplin.ru
Пароль:   Admin@2026!
\`\`\`
      `,
        )
        .setVersion('1.0.0')
        .addBearerAuth(
            {type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header'},
            'Bearer',
        )
        .addTag('Аутентификация', 'Регистрация, вход, обновление токенов')
        .addTag('Соискатели (личный кабинет)', 'Профиль, отклики, избранное, контакты')
        .addTag('Работодатели (личный кабинет)', 'Профиль компании, вакансии, управление откликами')
        .addTag('Кураторы (панель администрирования)', 'Модерация, верификация, управление пользователями')
        .addTag('Возможности (вакансии, стажировки, мероприятия)', 'CRUD вакансий, карта, фильтры')
        .addTag('Теги', 'Управление тегами')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'none',
            filter: true,
            showRequestDuration: true,
            tryItOutEnabled: true,
        },
        customSiteTitle: 'Трамплин — API Документация',
    });

    await app.listen(port);

    const logger = new Logger('Bootstrap');
    logger.log(`Сервер запущен: http://localhost:${port}/api/v1`);
    logger.log(`Swagger UI:     http://localhost:${port}/api/docs`);
}

bootstrap();
