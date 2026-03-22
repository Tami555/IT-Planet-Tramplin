import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiConsumes,
    ApiQuery,
} from '@nestjs/swagger';
import {FilesInterceptor} from '@nestjs/platform-express';
import {memoryStorage} from 'multer';
import {Role} from '@prisma/client';
import {OpportunitiesService} from './opportunities.service';
import {
    CreateOpportunityDto,
    UpdateOpportunityDto,
    OpportunityFilterDto,
    ModerationDto,
} from './dto/opportunity.dto';
import {JwtAuthGuard} from '@/common/guards/jwt-auth.guard';
import {RolesGuard} from '@/common/guards/roles.guard';
import {Roles} from '@/common/decorators/roles.decorator';
import {CurrentUser} from '@/common/decorators/current-user.decorator';
import {Public} from '@/common/decorators/public.decorator';
import {JwtPayload} from '@/auth/interfaces/jwt-payload.interface';

@ApiTags('Возможности (вакансии, стажировки, мероприятия)')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('opportunities')
export class OpportunitiesController {
    constructor(private readonly opportunitiesService: OpportunitiesService) {
    }

    @Public()
    @Get()
    @ApiOperation({
        summary: 'Список возможностей',
        description: 'Публичный. Активные возможности с пагинацией и фильтрами.',
    })
    @ApiResponse({status: 200, description: 'Список возможностей'})
    findAll(@Query() filter: OpportunityFilterDto) {
        return this.opportunitiesService.findAll(filter);
    }

    @Public()
    @Get('map')
    @ApiOperation({
        summary: 'Данные для карты',
        description: 'Возможности с координатами для маркеров на карте. Включает модульную карточку.',
    })
    @ApiResponse({status: 200, description: 'Массив точек для карты'})
    findForMap(@Query() filter: OpportunityFilterDto) {
        return this.opportunitiesService.findForMap(filter);
    }

    @Get('moderation')
    @Roles(Role.CURATOR)
    @ApiBearerAuth('Bearer')
    @ApiOperation({summary: 'Список на модерации', description: 'Только для кураторов.'})
    @ApiResponse({status: 200, description: 'Список на модерации'})
    @ApiQuery({name: 'page', required: false})
    @ApiQuery({name: 'limit', required: false})
    findPendingModeration(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.opportunitiesService.findPendingModeration(page, limit);
    }

    @Public()
    @Get(':id')
    @ApiParam({name: 'id', description: 'UUID возможности'})
    @ApiOperation({summary: 'Полная карточка возможности'})
    @ApiResponse({status: 200, description: 'Карточка возможности'})
    @ApiResponse({status: 404, description: 'Не найдена'})
    findOne(@Param('id') id: string) {
        return this.opportunitiesService.findOne(id);
    }

    @Post()
    @Roles(Role.EMPLOYER)
    @ApiBearerAuth('Bearer')
    @ApiOperation({
        summary: 'Создать возможность',
        description: 'Только для верифицированных работодателей. После создания — на модерацию.',
    })
    @ApiResponse({status: 201, description: 'Создана, отправлена на модерацию'})
    @ApiResponse({status: 403, description: 'Компания не верифицирована'})
    create(@Body() dto: CreateOpportunityDto, @CurrentUser() user: JwtPayload) {
        return this.opportunitiesService.create(dto, user.sub);
    }

    @Patch(':id')
    @Roles(Role.EMPLOYER, Role.CURATOR)
    @ApiBearerAuth('Bearer')
    @ApiParam({name: 'id', description: 'UUID возможности'})
    @ApiOperation({
        summary: 'Обновить возможность',
        description: 'Работодатель — только свои. После правки — снова на модерацию. Куратор — без повторной модерации.',
    })
    @ApiResponse({status: 200, description: 'Обновлена'})
    @ApiResponse({status: 403, description: 'Нет прав'})
    @ApiResponse({status: 404, description: 'Не найдена'})
    update(@Param('id') id: string, @Body() dto: UpdateOpportunityDto, @CurrentUser() user: JwtPayload) {
        return this.opportunitiesService.update(id, dto, user.sub, user.role);
    }

    @Post(':id/media')
    @Roles(Role.EMPLOYER, Role.CURATOR)
    @ApiBearerAuth('Bearer')
    @UseInterceptors(FilesInterceptor('files', 10, {storage: memoryStorage()}))
    @ApiConsumes('multipart/form-data')
    @ApiParam({name: 'id', description: 'UUID возможности'})
    @ApiOperation({summary: 'Загрузить медиа', description: 'До 10 файлов.'})
    @ApiResponse({status: 201, description: 'Загружено'})
    uploadMedia(
        @Param('id') id: string,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser() user: JwtPayload,
    ) {
        return this.opportunitiesService.uploadMedia(id, files, user.sub, user.role);
    }

    @Patch(':id/moderate')
    @Roles(Role.CURATOR)
    @ApiBearerAuth('Bearer')
    @ApiParam({name: 'id', description: 'UUID возможности'})
    @ApiOperation({summary: 'Промодерировать', description: 'ACTIVE = одобрить, REJECTED = отклонить.'})
    @ApiResponse({status: 200, description: 'Статус обновлён'})
    @ApiResponse({status: 403, description: 'Только для кураторов'})
    moderate(@Param('id') id: string, @Body() dto: ModerationDto, @CurrentUser() user: JwtPayload) {
        return this.opportunitiesService.moderate(id, dto, user.sub);
    }

    @Delete(':id')
    @Roles(Role.EMPLOYER, Role.CURATOR)
    @ApiBearerAuth('Bearer')
    @ApiParam({name: 'id', description: 'UUID возможности'})
    @ApiOperation({summary: 'Удалить возможность'})
    @ApiResponse({status: 200, description: 'Удалена'})
    @ApiResponse({status: 403, description: 'Нет прав'})
    @ApiResponse({status: 404, description: 'Не найдена'})
    remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
        return this.opportunitiesService.remove(id, user.sub, user.role);
    }
}
