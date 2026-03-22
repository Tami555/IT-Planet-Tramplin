import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import {VerificationStatus, OpportunityStatus} from '@prisma/client';
import {PrismaService} from '@/prisma.service';
import {
    UpdateEmployerProfileDto,
    SubmitVerificationDto,
    UpdateApplicationStatusDto,
    EmployerApplicationsFilterDto,
} from './dto/employer.dto';
import {FilesService} from '@/files/files.service';
import {OpportunitiesService} from '@/opportunities/opportunities.service';
import {buildPaginatedResponse} from '@/common/dto/pagination.dto';

@Injectable()
export class EmployersService {
    constructor(
        private prisma: PrismaService,
        private filesService: FilesService,
        private opportunitiesService: OpportunitiesService,
    ) {
    }

    async getMyProfile(userId: string) {
        return this.getEmployerByUserId(userId);
    }

    async getPublicProfile(id: string) {
        const employer = await this.prisma.employer.findUnique({
            where: {id},
            select: {
                id: true,
                companyName: true,
                description: true,
                industry: true,
                websiteUrl: true,
                socialLinks: true,
                logoUrl: true,
                city: true,
                verificationStatus: true,
                _count: {select: {opportunities: true}},
            },
        });
        if (!employer) throw new NotFoundException('Профиль работодателя не найден');
        if (employer.verificationStatus !== VerificationStatus.VERIFIED) {
            throw new NotFoundException('Профиль работодателя недоступен');
        }
        return employer;
    }

    async updateProfile(userId: string, dto: UpdateEmployerProfileDto) {
        const employer = await this.getEmployerByUserId(userId);
        return this.prisma.employer.update({
            where: {id: employer.id},
            data: dto,
        });
    }

    async uploadLogo(userId: string, file: Express.Multer.File) {
        const employer = await this.getEmployerByUserId(userId);
        if (employer.logoUrl) this.filesService.deleteFile(employer.logoUrl);
        const url = await this.filesService.saveFile(file, 'logos');
        return this.prisma.employer.update({
            where: {id: employer.id},
            data: {logoUrl: url},
        });
    }

    async uploadOfficePhotos(userId: string, files: Express.Multer.File[]) {
        const employer = await this.getEmployerByUserId(userId);
        const urls = await this.filesService.saveMultipleFiles(files, 'office');
        return this.prisma.employer.update({
            where: {id: employer.id},
            data: {officePhotoUrls: {push: urls}},
        });
    }

    async submitVerification(userId: string, dto: SubmitVerificationDto) {
        const employer = await this.getEmployerByUserId(userId);

        if (employer.verificationStatus === VerificationStatus.VERIFIED) {
            throw new BadRequestException('Компания уже прошла верификацию');
        }

        if (!dto.corporateEmail && !dto.inn) {
            throw new BadRequestException(
                'Необходимо указать хотя бы один идентификатор: корпоративный email или ИНН',
            );
        }

        if (dto.corporateEmail && employer.websiteUrl) {
            const emailDomain = dto.corporateEmail.split('@')[1];
            const siteDomain = new URL(
                employer.websiteUrl.startsWith('http')
                    ? employer.websiteUrl
                    : `https://${employer.websiteUrl}`,
            ).hostname.replace('www.', '');

            if (!siteDomain.includes(emailDomain.split('.')[0])) {
                console.warn(
                    `Домен email (${emailDomain}) не совпадает с сайтом (${siteDomain}). Требует ручной проверки.`,
                );
            }
        }

        return this.prisma.employer.update({
            where: {id: employer.id},
            data: {
                corporateEmail: dto.corporateEmail,
                inn: dto.inn,
                websiteUrl: dto.websiteUrl ?? employer.websiteUrl,
                verificationStatus: VerificationStatus.PENDING,
                verificationNote: null,
            },
        });
    }

    async getMyOpportunities(
        userId: string,
        status?: OpportunityStatus,
        page = 1,
        limit = 20,
    ) {
        const employer = await this.getEmployerByUserId(userId);
        return this.opportunitiesService.findByEmployer(employer.id, status, page, limit);
    }

    async getApplications(
        userId: string,
        filter: EmployerApplicationsFilterDto,
        page = 1,
        limit = 20,
    ) {
        const employer = await this.getEmployerByUserId(userId);
        const skip = (page - 1) * limit;

        const where: any = {
            opportunity: {employerId: employer.id},
            ...(filter.opportunityId && {opportunityId: filter.opportunityId}),
            ...(filter.status && {status: filter.status}),
        };

        const [data, total] = await Promise.all([
            this.prisma.application.findMany({
                where,
                skip,
                take: limit,
                orderBy: {createdAt: 'desc'},
                include: {
                    applicant: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            university: true,
                            avatarUrl: true,
                            skills: true,
                            portfolioLinks: true,
                            resumeUrl: true,
                            privacyResume: true,
                        },
                    },
                    opportunity: {
                        select: {id: true, title: true, type: true},
                    },
                },
            }),
            this.prisma.application.count({where}),
        ]);

        return buildPaginatedResponse(data, total, page, limit);
    }

    async updateApplicationStatus(
        userId: string,
        applicationId: string,
        dto: UpdateApplicationStatusDto,
    ) {
        const employer = await this.getEmployerByUserId(userId);

        const application = await this.prisma.application.findUnique({
            where: {id: applicationId},
            include: {opportunity: true},
        });

        if (!application) throw new NotFoundException('Отклик не найден');
        if (application.opportunity.employerId !== employer.id) {
            throw new ForbiddenException('Это не ваш отклик');
        }

        return this.prisma.application.update({
            where: {id: applicationId},
            data: {status: dto.status},
        });
    }

    async getApplicantProfile(userId: string, applicantId: string) {
        const employer = await this.getEmployerByUserId(userId);

        const application = await this.prisma.application.findFirst({
            where: {
                applicantId,
                opportunity: {employerId: employer.id},
            },
        });

        if (!application) {
            throw new ForbiddenException(
                'Просмотр профиля доступен только для соискателей, которые откликнулись на ваши вакансии',
            );
        }

        return this.prisma.applicant.findUnique({
            where: {id: applicantId},
            select: {
                id: true,
                firstName: true,
                lastName: true,
                university: true,
                graduationYear: true,
                course: true,
                bio: true,
                avatarUrl: true,
                resumeUrl: true,
                portfolioLinks: true,
                skills: true,
            },
        });
    }

    async getEmployerByUserId(userId: string) {
        const employer = await this.prisma.employer.findUnique({where: {userId}});
        if (!employer) {
            throw new NotFoundException('Профиль работодателя не найден');
        }
        return employer;
    }
}
