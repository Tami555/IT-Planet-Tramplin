import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Get,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import {Request} from 'express';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {AuthService} from './auth.service';
import {
    RegisterDto,
    LoginDto,
    RefreshTokenDto,
    AuthResponseDto,
} from './dto/auth.dto';
import {CurrentUser} from '@/common/decorators/current-user.decorator';
import {Public} from '@/common/decorators/public.decorator';
import {JwtPayload} from './interfaces/jwt-payload.interface';
import {RegisterApplicantDto} from "@/auth/dto/register-applicant.dto";
import {RegisterEmployerDto} from "@/auth/dto/register-employer.dto";

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
    }

    @ApiBearerAuth('Bearer')
    @Get('verify')
    @ApiOperation({
        summary: 'Проверка валидности access-токена',
        description: 'Возвращает объект с полем valid: true/false',
    })
    @ApiResponse({ status: 200, description: 'Результат проверки' })
    async verifyToken(@Req() req: Request) {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return { valid: false };
            }

            const token = authHeader.slice(7);
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            });

            const user = await this.authService.findUserById(payload.sub);
            if (!user || !user.isActive) {
                return { valid: false };
            }

            return {
                valid: true,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
            };
        } catch (error) {
            return { valid: false };
        }
    }

    // @Public()
    // @Post('register')
    // @ApiOperation({
    //     summary: 'Регистрация нового пользователя',
    //     description:
    //         'Создаёт аккаунт соискателя или работодателя. Работодатели автоматически получают статус верификации PENDING.',
    // })
    // @ApiResponse({status: 201, description: 'Пользователь успешно зарегистрирован', type: AuthResponseDto})
    // @ApiResponse({status: 400, description: 'Некорректные данные'})
    // @ApiResponse({status: 409, description: 'Email уже занят'})
    // register(@Body() dto: RegisterDto) {
    //     return this.authService.register(dto);
    // }

    @Public()
    @Post('register/applicant')
    @ApiOperation({
        summary: 'Регистрация соискателя',
        description: 'Создаёт аккаунт соискателя с профилем'
    })
    @ApiResponse({ status: 201, description: 'Соискатель успешно зарегистрирован', type: AuthResponseDto })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 409, description: 'Email уже занят' })
    registerApplicant(@Body() dto: RegisterApplicantDto) {
        return this.authService.registerApplicant(dto);
    }

    @Public()
    @Post('register/employer')
    @ApiOperation({
        summary: 'Регистрация работодателя',
        description: 'Создаёт аккаунт работодателя с профилем компании'
    })
    @ApiResponse({ status: 201, description: 'Работодатель успешно зарегистрирован', type: AuthResponseDto })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 409, description: 'Email уже занят' })
    registerEmployer(@Body() dto: RegisterEmployerDto) {
        return this.authService.registerEmployer(dto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Вход в систему',
        description: 'Возвращает access-токен (15 мин) и refresh-токен (7 дней).',
    })
    @ApiResponse({status: 200, description: 'Успешный вход', type: AuthResponseDto})
    @ApiResponse({status: 401, description: 'Неверный email или пароль'})
    @ApiResponse({status: 403, description: 'Аккаунт деактивирован'})
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Обновление токенов',
        description:
            'Принимает refresh-токен и возвращает новую пару токенов. Старый токен инвалидируется (ротация).',
    })
    @ApiResponse({status: 200, description: 'Токены успешно обновлены', type: AuthResponseDto})
    @ApiResponse({status: 401, description: 'Refresh-токен недействителен или истёк'})
    refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refresh(dto);
    }

    @Public()
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('Bearer')
    @ApiOperation({
        summary: 'Выход из системы',
        description:
            'Инвалидирует refresh-токен текущего устройства. Передайте access-токен в заголовке `Authorization: Bearer <token>` и refresh-токен в теле запроса.',
    })
    @ApiResponse({status: 200, description: 'Успешный выход'})
    @ApiResponse({status: 401, description: 'Access-токен отсутствует или недействителен'})
    async logout(@Req() req: Request, @Body() dto: RefreshTokenDto) {
        const userId = this.extractUserIdFromRequest(req);
        return this.authService.logout(userId, dto.refreshToken);
    }

    @Public()
    @Post('logout-all')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('Bearer')
    @ApiOperation({
        summary: 'Выход на всех устройствах',
        description: 'Инвалидирует все refresh-токены пользователя.',
    })
    @ApiResponse({status: 200, description: 'Выход выполнен на всех устройствах'})
    @ApiResponse({status: 401, description: 'Access-токен отсутствует или недействителен'})
    async logoutAll(@Req() req: Request) {
        const userId = this.extractUserIdFromRequest(req);
        return this.authService.logoutAll(userId);
    }

    @Get('me')
    @ApiBearerAuth('Bearer')
    @ApiOperation({
        summary: 'Текущий пользователь',
        description: 'Возвращает данные авторизованного пользователя из JWT-токена.',
    })
    @ApiResponse({status: 200, description: 'Данные пользователя'})
    @ApiResponse({status: 401, description: 'Не авторизован'})
    me(@CurrentUser() user: JwtPayload) {
        return user;
    }

    private extractUserIdFromRequest(req: Request): string {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException(
                'Для выхода необходим access-токен в заголовке Authorization: Bearer <token>',
            );
        }

        const token = authHeader.slice(7);
        try {
            const payload = this.jwtService.verify<JwtPayload>(token, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            });
            return payload.sub;
        } catch {
            throw new UnauthorizedException(
                'Access-токен недействителен или истёк. Используйте /auth/refresh для обновления',
            );
        }
    }
}
