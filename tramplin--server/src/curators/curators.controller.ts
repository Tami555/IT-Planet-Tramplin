import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import {Role} from '@prisma/client';
import {CuratorsService} from './curators.service';
import {
    CreateCuratorDto,
    CuratorUserFilterDto,
    UpdateUserStatusDto,
    VerifyEmployerDto,
} from './dto/curator.dto';
import {ModerationDto} from '@/opportunities/dto/opportunity.dto';
import {OpportunitiesService} from '@/opportunities/opportunities.service';
import {JwtAuthGuard} from '@/common/guards/jwt-auth.guard';
import {RolesGuard} from '@/common/guards/roles.guard';
import {Roles} from '@/common/decorators/roles.decorator';
import {CurrentUser} from '@/common/decorators/current-user.decorator';
import {JwtPayload} from '@/auth/interfaces/jwt-payload.interface';

@ApiTags('Кураторы (панель администрирования)')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CURATOR)
@ApiBearerAuth('Bearer')
@Controller('curators')
export class CuratorsController {
    constructor(
        private readonly curatorsService: CuratorsService,
        private readonly opportunitiesService: OpportunitiesService,
    ) {
    }

    @Post('accounts')
    @ApiOperation({
        summary: 'Создать учётную запись куратора',
        description: 'Только для администратора.',
    })
    @ApiResponse({status: 201, description: 'Куратор создан'})
    @ApiResponse({status: 403, description: 'Только администратор'})
    @ApiResponse({status: 409, description: 'Email уже занят'})
    createCurator(@Body() dto: CreateCuratorDto, @CurrentUser() user: JwtPayload) {
        return this.curatorsService.createCurator(dto, user.sub);
    }

    @Get('accounts')
    @ApiOperation({summary: 'Список всех кураторов', description: 'Только для администратора.'})
    @ApiResponse({status: 200, description: 'Список кураторов'})
    getCurators(@CurrentUser() user: JwtPayload) {
        return this.curatorsService.getCurators(user.sub);
    }

    @Get('stats')
    @ApiOperation({summary: 'Статистика платформы'})
    @ApiResponse({status: 200, description: 'Сводная статистика'})
    getStats() {
        return this.curatorsService.getStats();
    }

    @Get('users')
    @ApiOperation({summary: 'Список пользователей'})
    @ApiResponse({status: 200, description: 'Пользователи с пагинацией'})
    @ApiQuery({name: 'role', required: false, enum: Role})
    @ApiQuery({name: 'search', required: false})
    @ApiQuery({name: 'page', required: false})
    @ApiQuery({name: 'limit', required: false})
    getUsers(@Query() filter: CuratorUserFilterDto) {
        return this.curatorsService.getUsers(filter);
    }

    @Get('users/:id')
    @ApiParam({name: 'id', description: 'UUID пользователя'})
    @ApiOperation({summary: 'Детальная информация о пользователе'})
    @ApiResponse({status: 200, description: 'Данные пользователя'})
    @ApiResponse({status: 404, description: 'Пользователь не найден'})
    getUserById(@Param('id') id: string) {
        return this.curatorsService.getUserById(id);
    }

    @Patch('users/:id/status')
    @ApiParam({name: 'id', description: 'UUID пользователя'})
    @ApiOperation({summary: 'Заблокировать / активировать пользователя'})
    @ApiResponse({status: 200, description: 'Статус обновлён'})
    @ApiResponse({status: 404, description: 'Пользователь не найден'})
    updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
        return this.curatorsService.updateUserStatus(id, dto);
    }

    @Get('applicants/:id')
    @ApiParam({name: 'id', description: 'UUID соискателя'})
    @ApiOperation({summary: 'Детальный профиль соискателя'})
    @ApiResponse({status: 200, description: 'Профиль соискателя'})
    getApplicantDetail(@Param('id') id: string) {
        return this.curatorsService.getApplicantDetail(id);
    }

    @Get('employers/:id')
    @ApiParam({name: 'id', description: 'UUID работодателя'})
    @ApiOperation({summary: 'Детальный профиль работодателя'})
    @ApiResponse({status: 200, description: 'Профиль работодателя'})
    getEmployerDetail(@Param('id') id: string) {
        return this.curatorsService.getEmployerDetail(id);
    }

    @Get('verification/pending')
    @ApiOperation({
        summary: 'Работодатели, ожидающие верификации',
        description:
            'Куратор проверяет: (1) соответствие домена корпоративного email сайту компании, (2) ИНН по ЕГРЮЛ.',
    })
    @ApiResponse({status: 200, description: 'Список на верификации'})
    @ApiQuery({name: 'page', required: false})
    @ApiQuery({name: 'limit', required: false})
    getPendingVerifications(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.curatorsService.getPendingVerifications(page, limit);
    }

    @Patch('verification/:employerId')
    @ApiParam({name: 'employerId', description: 'UUID работодателя'})
    @ApiOperation({summary: 'Принять или отклонить верификацию'})
    @ApiResponse({status: 200, description: 'Решение принято'})
    @ApiResponse({status: 400, description: 'Компания уже верифицирована'})
    @ApiResponse({status: 404, description: 'Работодатель не найден'})
    verifyEmployer(
        @Param('employerId') employerId: string,
        @Body() dto: VerifyEmployerDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.curatorsService.verifyEmployer(employerId, dto, user.sub);
    }

    @Get('moderation/opportunities')
    @ApiOperation({summary: 'Возможности на модерации'})
    @ApiResponse({status: 200, description: 'Список на модерации'})
    @ApiQuery({name: 'page', required: false})
    @ApiQuery({name: 'limit', required: false})
    getPendingOpportunities(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.curatorsService.getPendingOpportunities(page, limit);
    }

    @Patch('moderation/opportunities/:id')
    @ApiParam({name: 'id', description: 'UUID возможности'})
    @ApiOperation({summary: 'Промодерировать возможность', description: 'ACTIVE = одобрить, REJECTED = отклонить.'})
    @ApiResponse({status: 200, description: 'Статус обновлён'})
    @ApiResponse({status: 404, description: 'Возможность не найдена'})
    moderateOpportunity(
        @Param('id') id: string,
        @Body() dto: ModerationDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.opportunitiesService.moderate(id, dto, user.sub);
    }
}
