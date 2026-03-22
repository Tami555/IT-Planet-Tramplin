import {ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsInt, IsOptional, Max, Min} from 'class-validator';

export class PaginationDto {
    @ApiPropertyOptional({description: 'Страница (начиная с 1)', default: 1, minimum: 1})
    @IsOptional()
    @Type(() => Number)
    @IsInt({message: 'Страница должна быть целым числом'})
    @Min(1, {message: 'Страница не может быть меньше 1'})
    page?: number = 1;

    @ApiPropertyOptional({description: 'Количество элементов на странице', default: 20, minimum: 1, maximum: 100})
    @IsOptional()
    @Type(() => Number)
    @IsInt({message: 'Лимит должен быть целым числом'})
    @Min(1, {message: 'Лимит не может быть меньше 1'})
    @Max(100, {message: 'Лимит не может превышать 100'})
    limit?: number = 20;
}

export function paginate(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return {skip, take: limit};
}

export function buildPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
) {
    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}
