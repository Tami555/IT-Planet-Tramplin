import {
    Controller,
    Get,
    Patch,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
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
import {FileInterceptor, FilesInterceptor} from '@nestjs/platform-express';
import {memoryStorage} from 'multer';
import {Role, OpportunityStatus} from '@prisma/client';
import {EmployersService} from './employers.service';
import {
    UpdateEmployerProfileDto,
    SubmitVerificationDto,
    UpdateApplicationStatusDto,
    EmployerApplicationsFilterDto,
} from './dto/employer.dto';
import {JwtAuthGuard} from '@/common/guards/jwt-auth.guard';
import {RolesGuard} from '@/common/guards/roles.guard';
import {Roles} from '@/common/decorators/roles.decorator';
import {CurrentUser} from '@/common/decorators/current-user.decorator';
import {Public} from '@/common/decorators/public.decorator';
import {JwtPayload} from '@/auth/interfaces/jwt-payload.interface';

@ApiTags('Работодатели (личный кабинет)')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employers')
export class EmployersController {
    constructor(private readonly employersService: EmployersService) {
    }

    @Public()
    @Get(':id/public')
    @ApiParam({name: 'id', description: 'UUID работодателя'})
    @ApiOperation({summary: 'Публичный профиль компании'})
    @ApiResponse({status: 200, description: 'Профиль компании'})
    @ApiResponse({status: 404, description: 'Компания не найдена или не верифицирована'})
    getPublicProfile(@Param('id') id: string) {
        return this.employersService.getPublicProfile(id);
    }

    @Get('me')
    @Roles(Role.EMPLOYER)
    @ApiBearerAuth('Bearer')
    @ApiOperation({summary: 'Мой профиль работодателя'})
    @ApiResponse({status: 200, description: 'Профиль работодателя'})
    getMyProfile(@CurrentUser() user: JwtPayload) {
        return this.employersService.getMyProfile(user.sub);
    }

    @Patch('me')
    @Roles(Role.EMPLOYER)
    @ApiBearerAuth('Bearer')
    @ApiOperation({summary: 'Обновить профиль компании'})
    @ApiResponse({status: 200, description: 'Профиль обновлён'})
    updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateEmployerProfileDto) {
        return this.employersService.updateProfile(user.sub, dto);
    }

    @Post('me/logo')
    @Roles(Role.EMPLOYER)
    @ApiBearerAuth('Bearer')
    @UseInterceptors(FileInterceptor('file', {storage: memoryStorage()}))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({summary: 'Загрузить логотип компании'})
    @ApiResponse({status: 201, description: 'Логотип загружен'})
    uploadLogo(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
        return this.employersService.uploadLogo(user.sub, file);
    }

    @Post('me/office-photos')
    @Roles(Role.EMPLOYER)
    @ApiBearerAuth('Bearer')
    @UseInterceptors(FilesInterceptor('files', 10, {storage: memoryStorage()}))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({summary: 'Загрузить фото офиса', description: 'До 10 фотографий.'})
    @ApiResponse({status: 201, description: 'Фото загружены'})
    uploadOfficePhotos(@CurrentUser() user: JwtPayload, @UploadedFiles() files: Express.Multer.File[]) {
        return this.employersService.uploadOfficePhotos(user.sub, files);
    }

    @Post('me/verification')
    @Roles(Role.EMPLOYER)
    @ApiBearerAuth('Bearer')
    @ApiOperation({
        summary: 'Подать заявку на верификацию',
        description:
            'Двухуровневая верификация: (1) корпоративный email с автопроверкой домена, (2) ИНН для ручной проверки куратором по ЕГРЮЛ.',
    })
    @ApiResponse({status: 201, description: 'Заявка на верификацию отправлена'})
    @ApiResponse({status: 400, description: 'Нужен email или ИНН / компания уже верифицирована'})
    submitVerification(@CurrentUser() user: JwtPayload, @Body() dto: SubmitVerificationDto) {
        return this.employersService.submitVerification(user.sub, dto);
    }

    @Get('me/opportunities')
    @Roles(Role.EMPLOYER)
    @ApiBearerAuth('Bearer')
    @ApiOperation({summary: 'Мои вакансии и мероприятия'})
    @ApiResponse({status: 200, description: 'Список вакансий'})
    @ApiQuery({name: 'status', enum: OpportunityStatus, required: false})
    @ApiQuery({name: 'page', required: false})
    @ApiQuery({name: 'limit', required: false})
    getMyOpportunities(
        @CurrentUser() user: JwtPayload,
        @Query('status') status?: OpportunityStatus,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.employersService.getMyOpportunities(user.sub, status, page, limit);
    }

    @Get('me/applications')
    @Roles(Role.EMPLOYER)
    @ApiBearerAuth('Bearer')
    @ApiOperation({summary: 'Отклики на мои вакансии'})
    @ApiResponse({status: 200, description: 'Список откликов'})
    @ApiQuery({name: 'page', required: false})
    @ApiQuery({name: 'limit', required: false})
    getApplications(
        @CurrentUser() user: JwtPayload,
        @Query() filter: EmployerApplicationsFilterDto,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.employersService.getApplications(user.sub, filter, page, limit);
    }

    @Patch('me/applications/:applicationId/status')
    @Roles(Role.EMPLOYER)
    @ApiBearerAuth('Bearer')
    @ApiParam({name: 'applicationId', description: 'UUID отклика'})
    @ApiOperation({summary: 'Изменить статус отклика', description: 'ACCEPTED / REJECTED / RESERVE'})
    @ApiResponse({status: 200, description: 'Статус отклика обновлён'})
    @ApiResponse({status: 403, description: 'Это не ваш отклик'})
    updateApplicationStatus(
        @CurrentUser() user: JwtPayload,
        @Param('applicationId') applicationId: string,
        @Body() dto: UpdateApplicationStatusDto,
    ) {
        return this.employersService.updateApplicationStatus(user.sub, applicationId, dto);
    }

    @Get('me/applications/:applicantId/applicant')
    @Roles(Role.EMPLOYER)
    @ApiBearerAuth('Bearer')
    @ApiParam({name: 'applicantId', description: 'UUID соискателя'})
    @ApiOperation({
        summary: 'Просмотреть профиль соискателя',
        description: 'Доступно только для соискателей, подавших отклик на вашу вакансию.',
    })
    @ApiResponse({status: 200, description: 'Профиль соискателя'})
    @ApiResponse({status: 403, description: 'Нет отклика от этого соискателя'})
    getApplicantProfile(@CurrentUser() user: JwtPayload, @Param('applicantId') applicantId: string) {
        return this.employersService.getApplicantProfile(user.sub, applicantId);
    }
}
