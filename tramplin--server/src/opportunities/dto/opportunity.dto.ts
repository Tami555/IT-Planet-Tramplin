import {ApiProperty, ApiPropertyOptional, PartialType} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
} from 'class-validator';
import {OpportunityType, WorkFormat} from '@prisma/client';

export class CreateOpportunityDto {
    @ApiProperty({example: 'Backend-разработчик (Junior)', description: 'Название вакансии или мероприятия'})
    @IsString({message: 'Название должно быть строкой'})
    @IsNotEmpty({message: 'Название обязательно для заполнения'})
    @MaxLength(200, {message: 'Название не может превышать 200 символов'})
    title: string;

    @ApiProperty({example: 'Ищем энергичного разработчика...', description: 'Подробное описание'})
    @IsString({message: 'Описание должно быть строкой'})
    @IsNotEmpty({message: 'Описание обязательно для заполнения'})
    description: string;

    @ApiProperty({enum: OpportunityType, example: OpportunityType.INTERNSHIP, description: 'Тип возможности'})
    @IsEnum(OpportunityType, {message: 'Некорректный тип возможности'})
    type: OpportunityType;

    @ApiProperty({enum: WorkFormat, example: WorkFormat.HYBRID, description: 'Формат работы'})
    @IsEnum(WorkFormat, {message: 'Некорректный формат работы'})
    format: WorkFormat;

    @ApiPropertyOptional({example: 'Москва, ул. Льва Толстого, 16', description: 'Адрес (для офиса/гибрида)'})
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({example: 'Москва', description: 'Город (для удалённого формата)'})
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({example: 55.7558, description: 'Широта для отображения на карте'})
    @IsOptional()
    @IsNumber({}, {message: 'Широта должна быть числом'})
    latitude?: number;

    @ApiPropertyOptional({example: 37.6173, description: 'Долгота для отображения на карте'})
    @IsOptional()
    @IsNumber({}, {message: 'Долгота должна быть числом'})
    longitude?: number;

    @ApiPropertyOptional({example: 80000, description: 'Зарплата от (руб.)'})
    @IsOptional()
    @Type(() => Number)
    @IsInt({message: 'Зарплата должна быть целым числом'})
    @Min(0, {message: 'Зарплата не может быть отрицательной'})
    salaryFrom?: number;

    @ApiPropertyOptional({example: 120000, description: 'Зарплата до (руб.)'})
    @IsOptional()
    @Type(() => Number)
    @IsInt({message: 'Зарплата должна быть целым числом'})
    @Min(0, {message: 'Зарплата не может быть отрицательной'})
    salaryTo?: number;

    @ApiPropertyOptional({example: 'RUB', description: 'Валюта'})
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiPropertyOptional({example: '2026-12-31', description: 'Дата окончания приёма откликов'})
    @IsOptional()
    @IsDateString({}, {message: 'Некорректный формат даты'})
    expiresAt?: string;

    @ApiPropertyOptional({example: '2026-05-15T10:00:00Z', description: 'Дата проведения мероприятия'})
    @IsOptional()
    @IsDateString({}, {message: 'Некорректный формат даты'})
    eventDate?: string;

    @ApiPropertyOptional({example: 'hr@company.ru', description: 'Email для связи'})
    @IsOptional()
    @IsString()
    contactEmail?: string;

    @ApiPropertyOptional({example: '+7 999 000-00-00', description: 'Телефон для связи'})
    @IsOptional()
    @IsString()
    contactPhone?: string;

    @ApiPropertyOptional({example: ['https://hh.ru/vacancy/123'], description: 'Ссылки на ресурсы'})
    @IsOptional()
    @IsArray({message: 'Контакт-ссылки должны быть массивом'})
    @IsString({each: true})
    contactLinks?: string[];

    @ApiPropertyOptional({type: [String], description: 'UUID тегов'})
    @IsOptional()
    @IsArray({message: 'Теги должны быть массивом'})
    @IsUUID('4', {each: true, message: 'Каждый тег должен быть корректным UUID'})
    tagIds?: string[];
}

export class UpdateOpportunityDto extends PartialType(CreateOpportunityDto) {
}

export class OpportunityFilterDto {
    @ApiPropertyOptional({enum: OpportunityType, description: 'Тип возможности'})
    @IsOptional()
    @IsEnum(OpportunityType, {message: 'Некорректный тип возможности'})
    type?: OpportunityType;

    @ApiPropertyOptional({enum: WorkFormat, description: 'Формат работы'})
    @IsOptional()
    @IsEnum(WorkFormat, {message: 'Некорректный формат работы'})
    format?: WorkFormat;

    @ApiPropertyOptional({example: 'python react', description: 'Поиск по названию и описанию'})
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({example: 50000, description: 'Минимальный уровень зарплаты'})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    salaryMin?: number;

    @ApiPropertyOptional({example: 150000, description: 'Максимальный уровень зарплаты'})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    salaryMax?: number;

    @ApiPropertyOptional({example: 'Москва', description: 'Фильтр по городу'})
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({type: [String], description: 'Фильтр по UUID тегов'})
    @IsOptional()
    @IsArray()
    tagIds?: string[];

    @ApiPropertyOptional({default: 1})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({default: 20})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;
}

export class ModerationDto {
    @ApiProperty({example: 'ACTIVE', description: 'Новый статус: ACTIVE или REJECTED'})
    @IsEnum(['ACTIVE', 'REJECTED'], {message: 'Статус должен быть ACTIVE или REJECTED'})
    status: 'ACTIVE' | 'REJECTED';

    @ApiPropertyOptional({example: 'Описание вакансии не соответствует стандартам платформы'})
    @IsOptional()
    @IsString()
    moderationNote?: string;
}
