import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {Role} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {PrismaService} from '@/prisma.service';
import {RegisterDto, LoginDto, RefreshTokenDto} from './dto/auth.dto';
import {JwtPayload} from './interfaces/jwt-payload.interface';
import {RegisterEmployerDto} from "@/auth/dto/register-employer.dto";
import {RegisterApplicantDto} from "@/auth/dto/register-applicant.dto";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private config: ConfigService,
    ) {
    }

    async registerApplicant(dto: RegisterApplicantDto) {
        const existing = await this.prisma.user.findUnique({
            where: {email: dto.email},
        });

        if (existing) {
            throw new ConflictException('Пользователь с таким email уже зарегистрирован');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);
        const displayName = `${dto.firstName} ${dto.lastName}`;

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                displayName,
                passwordHash,
                role: Role.APPLICANT,
                applicant: {
                    create: {
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                    },
                },
            },
            include: {applicant: true},
        });

        const tokens = await this.generateTokens(user.id, user.email, user.role);

        return {
            ...tokens,
            user: this.sanitizeUser(user),
        };
    }

    async findUserById(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
            },
        });
    }

    async registerEmployer(dto: RegisterEmployerDto) {
        const existing = await this.prisma.user.findUnique({
            where: {email: dto.email},
        });
        if (existing) {
            throw new ConflictException('Пользователь с таким email уже зарегистрирован');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                displayName: dto.companyName,
                passwordHash,
                role: Role.EMPLOYER,
                employer: {
                    create: {
                        companyName: dto.companyName,
                        verificationStatus: 'PENDING',
                    },
                },
            },
            include: {employer: true},
        });

        const tokens = await this.generateTokens(user.id, user.email, user.role);

        return {
            ...tokens,
            user: this.sanitizeUser(user),
        };
    }

    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({
            where: {email: dto.email},
        });
        if (existing) {
            throw new ConflictException('Пользователь с таким email уже зарегистрирован');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                displayName: dto.displayName,
                passwordHash,
                role: dto.role,
                ...(dto.role === 'APPLICANT' && {
                    applicant: {create: {firstName: '', lastName: ''}},
                }),
                ...(dto.role === 'EMPLOYER' && {
                    employer: {
                        create: {
                            companyName: dto.displayName,
                            verificationStatus: 'PENDING',
                        },
                    },
                }),
            },
        });

        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {...tokens, user: this.sanitizeUser(user)};
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: {email: dto.email},
        });

        if (!user) {
            throw new UnauthorizedException('Неверный email или пароль');
        }

        if (!user.isActive) {
            throw new ForbiddenException('Ваш аккаунт деактивирован. Обратитесь к куратору');
        }

        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            throw new UnauthorizedException('Неверный email или пароль');
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {...tokens, user: this.sanitizeUser(user)};
    }

    async refresh(dto: RefreshTokenDto) {
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: {token: dto.refreshToken},
            include: {user: true},
        });

        if (!storedToken) {
            throw new UnauthorizedException('Недействительный refresh-токен');
        }

        if (storedToken.expiresAt < new Date()) {
            await this.prisma.refreshToken.delete({where: {id: storedToken.id}});
            throw new UnauthorizedException('Срок действия refresh-токена истёк. Войдите снова');
        }

        if (!storedToken.user.isActive) {
            throw new ForbiddenException('Ваш аккаунт деактивирован');
        }

        await this.prisma.refreshToken.delete({where: {id: storedToken.id}});

        const tokens = await this.generateTokens(
            storedToken.user.id,
            storedToken.user.email,
            storedToken.user.role,
        );

        return {...tokens, user: this.sanitizeUser(storedToken.user)};
    }

    async logout(userId: string, refreshToken: string) {
        await this.prisma.refreshToken.deleteMany({
            where: {userId, token: refreshToken},
        });
        return {message: 'Вы успешно вышли из системы'};
    }

    async logoutAll(userId: string) {
        await this.prisma.refreshToken.deleteMany({where: {userId}});
        return {message: 'Вы вышли из системы на всех устройствах'};
    }

    private async generateTokens(userId: string, email: string, role: Role) {
        const payload: JwtPayload = {sub: userId, email, role};

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_ACCESS_SECRET'),
                expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
            }),
        ]);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId,
                expiresAt,
            },
        });

        return {accessToken, refreshToken};
    }

    private sanitizeUser(user: any) {
        return {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
        };
    }
}
