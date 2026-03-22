import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export enum TagCategory {
    TECHNOLOGY = 'technology',
    LEVEL = 'level',
    EMPLOYMENT = 'employment',
    CUSTOM = 'custom',
}

export class CreateTagDto {
    @ApiProperty({example: 'Kotlin', description: 'Название тега'})
    @IsString({message: 'Название тега должно быть строкой'})
    @IsNotEmpty({message: 'Название тега обязательно'})
    @MaxLength(50, {message: 'Название тега не может превышать 50 символов'})
    name: string;

    @ApiProperty({
        enum: TagCategory,
        example: TagCategory.TECHNOLOGY,
        description: 'Категория тега',
    })
    @IsEnum(TagCategory, {
        message: 'Категория должна быть одной из: technology, level, employment, custom',
    })
    category: TagCategory;
}

export class TagFilterDto {
    @ApiPropertyOptional({enum: TagCategory, description: 'Фильтр по категории'})
    @IsOptional()
    @IsEnum(TagCategory, {message: 'Некорректная категория тега'})
    category?: TagCategory;

    @ApiPropertyOptional({example: 'python', description: 'Поиск по названию'})
    @IsOptional()
    @IsString()
    search?: string;
}
