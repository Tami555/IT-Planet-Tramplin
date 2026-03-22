import {ApiProperty} from '@nestjs/swagger';
import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsString,
    MinLength,
    MaxLength,
    Matches,
} from 'class-validator';

const REGISTER_ROLES = ['APPLICANT', 'EMPLOYER'] as const;
type RegisterRole = (typeof REGISTER_ROLES)[number];

export class RegisterDto {
    @ApiProperty({example: 'ivan@example.com', description: 'Адрес электронной почты'})
    @IsEmail({}, {message: 'Некорректный формат электронной почты'})
    @IsNotEmpty({message: 'Email обязателен для заполнения'})
    email: string;

    @ApiProperty({example: 'Иван Иванов', description: 'Отображаемое имя пользователя'})
    @IsString({message: 'Имя должно быть строкой'})
    @IsNotEmpty({message: 'Отображаемое имя обязательно для заполнения'})
    @MaxLength(100, {message: 'Имя не может превышать 100 символов'})
    displayName: string;

    @ApiProperty({
        example: 'Password123!',
        description: 'Пароль (минимум 8 символов, заглавная буква, цифра)',
    })
    @IsString({message: 'Пароль должен быть строкой'})
    @MinLength(8, {message: 'Пароль должен содержать не менее 8 символов'})
    @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
        message: 'Пароль должен содержать хотя бы одну заглавную букву и одну цифру',
    })
    password: string;

    @ApiProperty({
        enum: REGISTER_ROLES,
        example: 'APPLICANT',
        description: 'Роль: APPLICANT (соискатель) или EMPLOYER (работодатель)',
    })
    @IsEnum(REGISTER_ROLES, {
        message: 'Роль должна быть "APPLICANT" (соискатель) или "EMPLOYER" (работодатель)',
    })
    role: RegisterRole;
}

export class LoginDto {
    @ApiProperty({example: 'ivan@example.com', description: 'Email пользователя'})
    @IsEmail({}, {message: 'Некорректный формат электронной почты'})
    @IsNotEmpty({message: 'Email обязателен для заполнения'})
    email: string;

    @ApiProperty({example: 'Password123!', description: 'Пароль'})
    @IsString({message: 'Пароль должен быть строкой'})
    @IsNotEmpty({message: 'Пароль обязателен для заполнения'})
    password: string;
}

export class RefreshTokenDto {
    @ApiProperty({description: 'Refresh-токен для обновления сессии'})
    @IsString({message: 'Refresh-токен должен быть строкой'})
    @IsNotEmpty({message: 'Refresh-токен обязателен'})
    refreshToken: string;
}

export class AuthResponseDto {
    @ApiProperty({description: 'Access-токен (живёт 15 минут)'})
    accessToken: string;

    @ApiProperty({description: 'Refresh-токен (живёт 7 дней)'})
    refreshToken: string;

    @ApiProperty({description: 'Информация о пользователе'})
    user: {
        id: string;
        email: string;
        displayName: string;
        role: string;
    };
}
