import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {
    IsArray,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
    Matches, IsBoolean, Min, IsInt, Max,
} from 'class-validator';
import {ApplicationStatus} from '@prisma/client';
import {Type} from "class-transformer";

export class UpdateEmployerProfileDto {
    @ApiPropertyOptional({example: 'Яндекс', description: 'Название компании'})
    @IsOptional()
    @IsString()
    @MaxLength(200)
    companyName?: string;

    @ApiPropertyOptional({example: 'Крупнейшая IT-компания России...', description: 'Описание компании'})
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;

    @ApiPropertyOptional({example: 'Информационные технологии', description: 'Сфера деятельности'})
    @IsOptional()
    @IsString()
    @MaxLength(100)
    industry?: string;

    @ApiPropertyOptional({example: 'https://yandex.ru', description: 'Сайт компании'})
    @IsOptional()
    @IsString()
    websiteUrl?: string;

    @ApiPropertyOptional({type: [String], example: ['https://vk.com/yandex'], description: 'Ссылки на соцсети'})
    @IsOptional()
    @IsArray()
    @IsString({each: true})
    socialLinks?: string[];

    @ApiPropertyOptional({example: 'Москва', description: 'Город работодателя'})
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({
        example: 'hr@techcompany.ru',
        description: 'Корпоративный email для верификации'
    })
    @IsOptional()
    @IsString()
    corporateEmail?: string;

    @ApiPropertyOptional({
        example: '7736207543',
        description: 'ИНН организации (10 цифр)'
    })
    @IsOptional()
    @IsString()
    @Matches(/^\d{10}$/, { message: 'ИНН должен содержать ровно 10 цифр' })
    inn?: string;
}

export class SubmitVerificationDto {
    @ApiPropertyOptional({
        example: true,
        description: 'Подтверждение, что данные для верификации заполнены'
    })
    @IsOptional()
    @IsBoolean()
    confirm?: boolean;
}

export class ReviewVerificationDto {
    @ApiProperty({enum: ['VERIFIED', 'REJECTED'], example: 'VERIFIED', description: 'Решение по верификации'})
    @IsEnum(['VERIFIED', 'REJECTED'], {
        message: 'Статус должен быть VERIFIED (верифицирован) или REJECTED (отклонён)',
    })
    status: 'VERIFIED' | 'REJECTED';

    @ApiPropertyOptional({example: 'ИНН не соответствует официальным данным ЕГРЮЛ'})
    @IsOptional()
    @IsString()
    @MaxLength(500)
    note?: string;
}

export class UpdateApplicationStatusDto {
    @ApiProperty({
        enum: ApplicationStatus,
        example: ApplicationStatus.ACCEPTED,
        description: 'Новый статус отклика',
    })
    @IsEnum(ApplicationStatus, {
        message: 'Статус должен быть PENDING, ACCEPTED, REJECTED или RESERVE',
    })
    status: ApplicationStatus;
}

export class EmployerApplicationsFilterDto {
    @ApiPropertyOptional({example: 'uuid-opportunity', description: 'Фильтр по UUID вакансии'})
    @IsOptional()
    @IsString()
    opportunityId?: string;

    @ApiPropertyOptional({enum: ApplicationStatus, description: 'Фильтр по статусу'})
    @IsOptional()
    @IsEnum(ApplicationStatus)
    status?: ApplicationStatus;

    @ApiPropertyOptional({ default: 1, description: 'Страница' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20, description: 'Количество на странице' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;
}
