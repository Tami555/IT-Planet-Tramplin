import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import {Role} from '@prisma/client';

export class CreateCuratorDto {
    @ApiProperty({example: 'curator@university.ru', description: 'Email нового куратора'})
    @IsEmail({}, {message: 'Некорректный формат электронной почты'})
    @IsNotEmpty({message: 'Email обязателен'})
    email: string;

    @ApiProperty({example: 'Мария Петрова', description: 'Отображаемое имя куратора'})
    @IsString({message: 'Имя должно быть строкой'})
    @IsNotEmpty({message: 'Имя обязательно'})
    @MaxLength(100)
    displayName: string;

    @ApiProperty({example: 'Curator@2026!', description: 'Пароль (мин. 8 символов)'})
    @IsString()
    @MinLength(8, {message: 'Пароль должен содержать не менее 8 символов'})
    @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
        message: 'Пароль должен содержать хотя бы одну заглавную букву и цифру',
    })
    password: string;

    @ApiPropertyOptional({default: false, description: 'Назначить администратором'})
    @IsOptional()
    @IsBoolean()
    isAdmin?: boolean;
}

export class CuratorUserFilterDto {
    @ApiPropertyOptional({enum: Role, description: 'Фильтр по роли'})
    @IsOptional()
    @IsEnum(Role, {message: 'Некорректная роль'})
    role?: Role;

    @ApiPropertyOptional({example: 'иван', description: 'Поиск по имени или email'})
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({default: 1})
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({default: 20})
    @IsOptional()
    limit?: number;
}

export class UpdateUserStatusDto {
    @ApiProperty({description: 'Активен ли пользователь'})
    @IsBoolean({message: 'Значение должно быть булевым (true/false)'})
    isActive: boolean;
}

export class CuratorUpdateOpportunityDto {
    @ApiPropertyOptional({example: 'Описание обновлено куратором'})
    @IsOptional()
    @IsString()
    moderationNote?: string;
}

export class VerifyEmployerDto {
    @ApiProperty({enum: ['VERIFIED', 'REJECTED'], description: 'Решение по верификации'})
    @IsEnum(['VERIFIED', 'REJECTED'], {
        message: 'Статус верификации должен быть VERIFIED или REJECTED',
    })
    status: 'VERIFIED' | 'REJECTED';

    @ApiPropertyOptional({example: 'Данные проверены по ЕГРЮЛ, компания подтверждена'})
    @IsOptional()
    @IsString()
    @MaxLength(500)
    note?: string;
}
