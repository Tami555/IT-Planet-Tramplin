import {
    Controller,
    Get,
    Patch,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiConsumes,
    ApiQuery,
    ApiBody
} from '@nestjs/swagger';
import {FileInterceptor} from '@nestjs/platform-express';
import {memoryStorage} from 'multer';
import {Role} from '@prisma/client';
import {ApplicantsService} from './applicants.service';
import {
    UpdateApplicantProfileDto,
    UpdatePrivacyDto,
    CreateApplicationDto,
    AddToFavoritesDto,
    ContactRequestDto,
} from './dto/applicant.dto';
import {JwtAuthGuard} from '@/common/guards/jwt-auth.guard';
import {RolesGuard} from '@/common/guards/roles.guard';
import {Roles} from '@/common/decorators/roles.decorator';
import {CurrentUser} from '@/common/decorators/current-user.decorator';
import {Public} from '@/common/decorators/public.decorator';
import {JwtPayload} from '@/auth/interfaces/jwt-payload.interface';
import {SearchApplicantsDto} from "@/common/dto/search.dto";

@ApiTags('Соискатели (личный кабинет)')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applicants')
export class ApplicantsController {
    constructor(private readonly applicantsService: ApplicantsService) {
    }

    @Get('me')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @ApiOperation({summary: 'Мой профиль соискателя'})
    @ApiResponse({status: 200, description: 'Профиль соискателя'})
    getMyProfile(@CurrentUser() user: JwtPayload) {
        return this.applicantsService.getMyProfile(user.sub);
    }

    @Public()
    @Get(':id')
    @ApiParam({name: 'id', description: 'UUID соискателя'})
    @ApiOperation({
        summary: 'Профиль соискателя по ID',
        description: 'С учётом настроек приватности. Неавторизованные видят только PUBLIC профили.',
    })
    @ApiResponse({status: 200, description: 'Профиль соискателя'})
    @ApiResponse({status: 403, description: 'Доступ ограничен настройками приватности'})
    @ApiResponse({status: 404, description: 'Профиль не найден'})
    getProfile(@Param('id') id: string, @CurrentUser() user?: JwtPayload) {
        return this.applicantsService.getProfile(id, user?.sub);
    }

    @Patch('me')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @ApiOperation({summary: 'Обновить профиль'})
    @ApiResponse({status: 200, description: 'Профиль обновлён'})
    updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateApplicantProfileDto) {
        return this.applicantsService.updateProfile(user.sub, dto);
    }

    @Patch('me/privacy')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @ApiOperation({
        summary: 'Настройки приватности',
        description: 'PRIVATE (только я), CONTACTS (контакты), PUBLIC (все авторизованные).',
    })
    @ApiResponse({status: 200, description: 'Настройки приватности обновлены'})
    updatePrivacy(@CurrentUser() user: JwtPayload, @Body() dto: UpdatePrivacyDto) {
        return this.applicantsService.updatePrivacy(user.sub, dto);
    }

    @Post('me/avatar')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @UseInterceptors(FileInterceptor('file', {storage: memoryStorage()}))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({summary: 'Загрузить аватар'})
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Файл изображения (JPEG, PNG, WEBP, GIF)',
                },
            },
        },
    })
    @ApiResponse({status: 201, description: 'Аватар загружен'})
    uploadAvatar(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
        return this.applicantsService.uploadAvatar(user.sub, file);
    }

    @Post('me/resume')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @UseInterceptors(FileInterceptor('file', {storage: memoryStorage()}))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({summary: 'Загрузить резюме', description: 'PDF. Видимость — по настройкам приватности.'})
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Файл резюме (PDF, JPEG, PNG)',
                },
            },
        },
    })
    @ApiResponse({status: 201, description: 'Резюме загружено'})
    uploadResume(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
        return this.applicantsService.uploadResume(user.sub, file);
    }

    @Post('me/applications')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @ApiOperation({summary: 'Откликнуться на вакансию'})
    @ApiResponse({status: 201, description: 'Отклик отправлен'})
    @ApiResponse({status: 400, description: 'Вакансия не принимает отклики'})
    @ApiResponse({status: 409, description: 'Вы уже откликались'})
    applyToOpportunity(@CurrentUser() user: JwtPayload, @Body() dto: CreateApplicationDto) {
        return this.applicantsService.applyToOpportunity(user.sub, dto);
    }

    @Get('me/applications')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @ApiOperation({summary: 'История откликов'})
    @ApiResponse({status: 200, description: 'История откликов с пагинацией'})
    @ApiQuery({name: 'page', required: false})
    @ApiQuery({name: 'limit', required: false})
    getMyApplications(
        @CurrentUser() user: JwtPayload,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.applicantsService.getMyApplications(user.sub, page, limit);
    }

    @Delete('me/applications/:applicationId')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @ApiParam({name: 'applicationId', description: 'UUID отклика'})
    @ApiOperation({summary: 'Отозвать отклик'})
    @ApiResponse({status: 200, description: 'Отклик отозван'})
    @ApiResponse({status: 400, description: 'Нельзя отозвать рассмотренный отклик'})
    withdrawApplication(@CurrentUser() user: JwtPayload, @Param('applicationId') id: string) {
        return this.applicantsService.withdrawApplication(user.sub, id);
    }

    @Post('me/favorites')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @ApiOperation({summary: 'Добавить в избранное'})
    @ApiResponse({status: 201, description: 'Добавлено в избранное'})
    @ApiResponse({status: 409, description: 'Уже в избранном'})
    addToFavorites(@CurrentUser() user: JwtPayload, @Body() dto: AddToFavoritesDto) {
        return this.applicantsService.addToFavorites(user.sub, dto);
    }

    @Get('me/favorites')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @ApiOperation({summary: 'Список избранного'})
    @ApiResponse({status: 200, description: 'Избранные вакансии'})
    @ApiQuery({name: 'page', required: false})
    @ApiQuery({name: 'limit', required: false})
    getMyFavorites(
        @CurrentUser() user: JwtPayload,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.applicantsService.getMyFavorites(user.sub, page, limit);
    }

    @Delete('me/favorites/:opportunityId')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @ApiParam({name: 'opportunityId', description: 'UUID вакансии'})
    @ApiOperation({summary: 'Убрать из избранного'})
    @ApiResponse({status: 200, description: 'Убрано из избранного'})
    removeFromFavorites(@CurrentUser() user: JwtPayload, @Param('opportunityId') id: string) {
        return this.applicantsService.removeFromFavorites(user.sub, id);
    }

    @Post('me/contacts')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @ApiOperation({summary: 'Отправить запрос на контакт'})
    @ApiResponse({status: 201, description: 'Запрос отправлен'})
    @ApiResponse({status: 400, description: 'Нельзя добавить самого себя'})
    @ApiResponse({status: 409, description: 'Уже в контактах или запрос отправлен'})
    sendContactRequest(@CurrentUser() user: JwtPayload, @Body() dto: ContactRequestDto) {
        return this.applicantsService.sendContactRequest(user.sub, dto);
    }

    @Get('me/contacts')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @ApiOperation({summary: 'Список контактов'})
    @ApiResponse({status: 200, description: 'Профессиональные контакты'})
    getMyContacts(@CurrentUser() user: JwtPayload) {
        return this.applicantsService.getMyContacts(user.sub);
    }

    @Get('me/contacts/requests')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @ApiOperation({summary: 'Входящие запросы на контакт'})
    @ApiResponse({status: 200, description: 'Ожидающие запросы'})
    getPendingContactRequests(@CurrentUser() user: JwtPayload) {
        return this.applicantsService.getPendingContactRequests(user.sub);
    }

    @Patch('me/contacts/:contactId/accept')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @ApiParam({name: 'contactId', description: 'UUID запроса'})
    @ApiOperation({summary: 'Принять запрос на контакт'})
    @ApiResponse({status: 200, description: 'Запрос принят'})
    acceptContact(@CurrentUser() user: JwtPayload, @Param('contactId') id: string) {
        return this.applicantsService.respondToContactRequest(user.sub, id, true);
    }

    @Patch('me/contacts/:contactId/reject')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @ApiParam({name: 'contactId', description: 'UUID запроса'})
    @ApiOperation({summary: 'Отклонить запрос на контакт'})
    @ApiResponse({status: 200, description: 'Запрос отклонён'})
    rejectContact(@CurrentUser() user: JwtPayload, @Param('contactId') id: string) {
        return this.applicantsService.respondToContactRequest(user.sub, id, false);
    }

    @Delete('me/contacts/:contactId')
    @Roles(Role.APPLICANT)
    @ApiBearerAuth('Bearer')
    @ApiParam({name: 'contactId', description: 'UUID контакта'})
    @ApiOperation({summary: 'Удалить контакт'})
    @ApiResponse({status: 200, description: 'Контакт удалён'})
    removeContact(@CurrentUser() user: JwtPayload, @Param('contactId') id: string) {
        return this.applicantsService.removeContact(user.sub, id);
    }

    @Public()
    @Get()
    @ApiOperation({
        summary: 'Поиск соискателей',
        description: 'Публичный эндпоинт для поиска соискателей с фильтрацией по имени, навыкам, учебному заведению.',
    })
    @ApiResponse({ status: 200, description: 'Список соискателей' })
    searchApplicants(
        @Query() dto: SearchApplicantsDto,
        @CurrentUser() user?: JwtPayload,
    ) {
        return this.applicantsService.searchApplicants(dto, user?.sub);
    }
}
