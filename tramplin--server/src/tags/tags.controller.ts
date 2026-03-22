import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import {Role} from '@prisma/client';
import {TagsService} from './tags.service';
import {CreateTagDto, TagFilterDto} from './dto/tag.dto';
import {JwtAuthGuard} from '@/common/guards/jwt-auth.guard';
import {RolesGuard} from '@/common/guards/roles.guard';
import {Roles} from '@/common/decorators/roles.decorator';
import {CurrentUser} from '@/common/decorators/current-user.decorator';
import {Public} from '@/common/decorators/public.decorator';
import {JwtPayload} from '@/auth/interfaces/jwt-payload.interface';

@ApiTags('Теги')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {
    }

    @Public()
    @Get()
    @ApiOperation({
        summary: 'Получить все теги',
        description: 'Публичный. Фильтрация по категории и поиск по названию.',
    })
    @ApiResponse({status: 200, description: 'Список тегов'})
    findAll(@Query() filter: TagFilterDto) {
        return this.tagsService.findAll(filter);
    }

    @Post()
    @Roles(Role.EMPLOYER, Role.CURATOR)
    @ApiBearerAuth('Bearer')
    @ApiOperation({
        summary: 'Создать тег',
        description: 'Работодатели и кураторы могут добавлять теги. Кураторы создают системные теги.',
    })
    @ApiResponse({status: 201, description: 'Тег создан'})
    @ApiResponse({status: 409, description: 'Тег уже существует'})
    create(@Body() dto: CreateTagDto, @CurrentUser() user: JwtPayload) {
        return this.tagsService.create(dto, user.sub, user.role);
    }

    @Delete(':id')
    @Roles(Role.CURATOR)
    @ApiBearerAuth('Bearer')
    @ApiParam({name: 'id', description: 'UUID тега'})
    @ApiOperation({summary: 'Удалить тег', description: 'Только куратор.'})
    @ApiResponse({status: 200, description: 'Удалён'})
    @ApiResponse({status: 403, description: 'Нет прав'})
    @ApiResponse({status: 404, description: 'Не найден'})
    remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
        return this.tagsService.remove(id, user.role);
    }
}
