import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchApplicantsDto {
    @ApiPropertyOptional({ description: 'Поиск по имени или фамилии' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Фильтр по навыкам (через запятую)' })
    @IsOptional()
    @IsString()
    skills?: string;

    @ApiPropertyOptional({ description: 'Фильтр по учебному заведению' })
    @IsOptional()
    @IsString()
    university?: string;

    @ApiPropertyOptional({ description: 'Фильтр по городу' })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({ description: 'Страница', default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Количество на странице', default: 20, maximum: 50 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 20;
}

export class SearchEmployersDto {
    @ApiPropertyOptional({ description: 'Поиск по названию компании' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Фильтр по сфере деятельности' })
    @IsOptional()
    @IsString()
    industry?: string;

    @ApiPropertyOptional({ description: 'Фильтр по городу' })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({ description: 'Только верифицированные', default: true })
    @IsOptional()
    @Type(() => Boolean)
    verifiedOnly?: boolean = true;

    @ApiPropertyOptional({ description: 'Страница', default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Количество на странице', default: 20, maximum: 50 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 20;
}