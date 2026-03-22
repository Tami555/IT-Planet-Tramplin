import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import {ApplicationStatus, ContactStatus, PrivacyLevel} from '@prisma/client';
import {PrismaService} from '@/prisma.service';
import {
    UpdateApplicantProfileDto,
    UpdatePrivacyDto,
    CreateApplicationDto,
    AddToFavoritesDto,
    ContactRequestDto,
} from './dto/applicant.dto';
import {FilesService} from '@/files/files.service';
import {buildPaginatedResponse} from '@/common/dto/pagination.dto';

@Injectable()
export class ApplicantsService {
    constructor(
        private prisma: PrismaService,
        private filesService: FilesService,
    ) {
    }

    async getMyProfile(userId: string) {
        return this.getApplicantByUserId(userId);
    }

    async getProfile(targetApplicantId: string, viewerUserId?: string) {
        const target = await this.prisma.applicant.findUnique({
            where: {id: targetApplicantId},
            include: {user: {select: {email: true, displayName: true, createdAt: true}}},
        });

        if (!target) throw new NotFoundException('Профиль соискателя не найден');

        if (viewerUserId) {
            const viewer = await this.prisma.applicant.findUnique({
                where: {userId: viewerUserId},
            });

            if (viewer?.id === targetApplicantId) return target;

            if (target.privacyProfile === PrivacyLevel.PRIVATE) {
                throw new ForbiddenException('Этот профиль скрыт пользователем');
            }

            if (target.privacyProfile === PrivacyLevel.CONTACTS && viewer) {
                const isContact = await this.areContacts(target.id, viewer.id);
                if (!isContact) throw new ForbiddenException('Профиль доступен только для контактов');
            }
        } else {
            if (target.privacyProfile !== PrivacyLevel.PUBLIC) {
                throw new ForbiddenException('Для просмотра профиля требуется авторизация');
            }
        }

        const canSeeResume = await this.canViewField(
            target,
            target.privacyResume,
            viewerUserId,
        );

        return {
            ...target,
            resumeUrl: canSeeResume ? target.resumeUrl : undefined,
        };
    }

    async updateProfile(userId: string, dto: UpdateApplicantProfileDto) {
        const applicant = await this.getApplicantByUserId(userId);
        return this.prisma.applicant.update({
            where: {id: applicant.id},
            data: dto,
        });
    }

    async updatePrivacy(userId: string, dto: UpdatePrivacyDto) {
        const applicant = await this.getApplicantByUserId(userId);
        return this.prisma.applicant.update({
            where: {id: applicant.id},
            data: dto,
        });
    }

    async uploadAvatar(userId: string, file: Express.Multer.File) {
        const applicant = await this.getApplicantByUserId(userId);
        if (applicant.avatarUrl) {
            this.filesService.deleteFile(applicant.avatarUrl);
        }
        const url = await this.filesService.saveFile(file, 'avatars');
        return this.prisma.applicant.update({
            where: {id: applicant.id},
            data: {avatarUrl: url},
        });
    }

    async uploadResume(userId: string, file: Express.Multer.File) {
        const applicant = await this.getApplicantByUserId(userId);
        if (applicant.resumeUrl) {
            this.filesService.deleteFile(applicant.resumeUrl);
        }
        const url = await this.filesService.saveFile(file, 'resumes');
        return this.prisma.applicant.update({
            where: {id: applicant.id},
            data: {resumeUrl: url},
        });
    }

    async applyToOpportunity(userId: string, dto: CreateApplicationDto) {
        const applicant = await this.getApplicantByUserId(userId);

        const opportunity = await this.prisma.opportunity.findUnique({
            where: {id: dto.opportunityId},
        });
        if (!opportunity) throw new NotFoundException('Вакансия не найдена');
        if (opportunity.status !== 'ACTIVE') {
            throw new BadRequestException('Вакансия больше не принимает отклики');
        }

        const existing = await this.prisma.application.findUnique({
            where: {
                applicantId_opportunityId: {
                    applicantId: applicant.id,
                    opportunityId: dto.opportunityId,
                },
            },
        });
        if (existing) throw new ConflictException('Вы уже откликнулись на эту вакансию');

        return this.prisma.application.create({
            data: {
                applicantId: applicant.id,
                opportunityId: dto.opportunityId,
                coverLetter: dto.coverLetter,
            },
            include: {
                opportunity: {
                    select: {id: true, title: true, type: true},
                },
            },
        });
    }

    async getMyApplications(userId: string, page = 1, limit = 20) {
        const applicant = await this.getApplicantByUserId(userId);
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.application.findMany({
                where: {applicantId: applicant.id},
                skip,
                take: limit,
                orderBy: {createdAt: 'desc'},
                include: {
                    opportunity: {
                        select: {
                            id: true,
                            title: true,
                            type: true,
                            format: true,
                            salaryFrom: true,
                            salaryTo: true,
                            employer: {select: {companyName: true, logoUrl: true}},
                        },
                    },
                },
            }),
            this.prisma.application.count({where: {applicantId: applicant.id}}),
        ]);

        return buildPaginatedResponse(data, total, page, limit);
    }

    async withdrawApplication(userId: string, applicationId: string) {
        const applicant = await this.getApplicantByUserId(userId);
        const application = await this.prisma.application.findUnique({
            where: {id: applicationId},
        });
        if (!application) throw new NotFoundException('Отклик не найден');
        if (application.applicantId !== applicant.id) {
            throw new ForbiddenException('Это не ваш отклик');
        }
        if (application.status !== ApplicationStatus.PENDING) {
            throw new BadRequestException('Нельзя отозвать отклик, который уже рассмотрен');
        }
        await this.prisma.application.delete({where: {id: applicationId}});
        return {message: 'Отклик успешно отозван'};
    }

    async addToFavorites(userId: string, dto: AddToFavoritesDto) {
        const applicant = await this.getApplicantByUserId(userId);

        const opportunity = await this.prisma.opportunity.findUnique({
            where: {id: dto.opportunityId},
        });
        if (!opportunity) throw new NotFoundException('Вакансия не найдена');

        const existing = await this.prisma.favorite.findUnique({
            where: {
                applicantId_opportunityId: {
                    applicantId: applicant.id,
                    opportunityId: dto.opportunityId,
                },
            },
        });
        if (existing) throw new ConflictException('Вакансия уже в избранном');

        return this.prisma.favorite.create({
            data: {applicantId: applicant.id, opportunityId: dto.opportunityId},
        });
    }

    async removeFromFavorites(userId: string, opportunityId: string) {
        const applicant = await this.getApplicantByUserId(userId);
        const fav = await this.prisma.favorite.findUnique({
            where: {
                applicantId_opportunityId: {applicantId: applicant.id, opportunityId},
            },
        });
        if (!fav) throw new NotFoundException('Вакансия не найдена в избранном');
        await this.prisma.favorite.delete({where: {id: fav.id}});
        return {message: 'Вакансия удалена из избранного'};
    }

    async getMyFavorites(userId: string, page = 1, limit = 20) {
        const applicant = await this.getApplicantByUserId(userId);
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.favorite.findMany({
                where: {applicantId: applicant.id},
                skip,
                take: limit,
                orderBy: {createdAt: 'desc'},
                include: {
                    opportunity: {
                        include: {
                            employer: {select: {companyName: true, logoUrl: true}},
                            tags: {include: {tag: true}},
                        },
                    },
                },
            }),
            this.prisma.favorite.count({where: {applicantId: applicant.id}}),
        ]);

        return buildPaginatedResponse(data, total, page, limit);
    }

    async sendContactRequest(userId: string, dto: ContactRequestDto) {
        const sender = await this.getApplicantByUserId(userId);

        if (sender.id === dto.receiverId) {
            throw new BadRequestException('Нельзя добавить самого себя в контакты');
        }

        const receiver = await this.prisma.applicant.findUnique({
            where: {id: dto.receiverId},
        });
        if (!receiver) throw new NotFoundException('Соискатель не найден');

        const existing = await this.prisma.contact.findFirst({
            where: {
                OR: [
                    {senderId: sender.id, receiverId: dto.receiverId},
                    {senderId: dto.receiverId, receiverId: sender.id},
                ],
            },
        });

        if (existing) {
            if (existing.status === ContactStatus.ACCEPTED) {
                throw new ConflictException('Пользователь уже в вашем списке контактов');
            }
            if (existing.status === ContactStatus.PENDING) {
                throw new ConflictException('Запрос на добавление уже отправлен');
            }
        }

        return this.prisma.contact.create({
            data: {senderId: sender.id, receiverId: dto.receiverId},
        });
    }

    async respondToContactRequest(
        userId: string,
        contactId: string,
        accept: boolean,
    ) {
        const applicant = await this.getApplicantByUserId(userId);
        const contact = await this.prisma.contact.findUnique({where: {id: contactId}});

        if (!contact) throw new NotFoundException('Запрос на контакт не найден');
        if (contact.receiverId !== applicant.id) {
            throw new ForbiddenException('Это не ваш запрос на контакт');
        }
        if (contact.status !== ContactStatus.PENDING) {
            throw new BadRequestException('Запрос уже был обработан');
        }

        if (!accept) {
            await this.prisma.contact.delete({where: {id: contactId}});
            return {message: 'Запрос отклонён'};
        }

        return this.prisma.contact.update({
            where: {id: contactId},
            data: {status: ContactStatus.ACCEPTED},
        });
    }

    async getMyContacts(userId: string) {
        const applicant = await this.getApplicantByUserId(userId);

        const contacts = await this.prisma.contact.findMany({
            where: {
                OR: [
                    {senderId: applicant.id, status: ContactStatus.ACCEPTED},
                    {receiverId: applicant.id, status: ContactStatus.ACCEPTED},
                ],
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        university: true,
                        skills: true,
                        privacyProfile: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        university: true,
                        skills: true,
                        privacyProfile: true,
                    },
                },
            },
        });

        return contacts.map((c) =>
            c.senderId === applicant.id ? c.receiver : c.sender,
        );
    }

    async getPendingContactRequests(userId: string) {
        const applicant = await this.getApplicantByUserId(userId);

        return this.prisma.contact.findMany({
            where: {receiverId: applicant.id, status: ContactStatus.PENDING},
            include: {
                sender: {
                    select: {id: true, firstName: true, lastName: true, avatarUrl: true},
                },
            },
        });
    }

    async removeContact(userId: string, contactId: string) {
        const applicant = await this.getApplicantByUserId(userId);
        const contact = await this.prisma.contact.findUnique({where: {id: contactId}});

        if (!contact) throw new NotFoundException('Контакт не найден');
        if (contact.senderId !== applicant.id && contact.receiverId !== applicant.id) {
            throw new ForbiddenException('Это не ваш контакт');
        }

        await this.prisma.contact.delete({where: {id: contactId}});
        return {message: 'Контакт удалён'};
    }

    async getApplicantByUserId(userId: string) {
        const applicant = await this.prisma.applicant.findUnique({
            where: {userId},
        });
        if (!applicant) {
            throw new NotFoundException('Профиль соискателя не найден. Заполните личный кабинет');
        }
        return applicant;
    }

    private async areContacts(applicantId1: string, applicantId2: string): Promise<boolean> {
        const contact = await this.prisma.contact.findFirst({
            where: {
                OR: [
                    {senderId: applicantId1, receiverId: applicantId2},
                    {senderId: applicantId2, receiverId: applicantId1},
                ],
                status: ContactStatus.ACCEPTED,
            },
        });
        return !!contact;
    }

    private async canViewField(
        target: any,
        privacy: PrivacyLevel,
        viewerUserId?: string,
    ): Promise<boolean> {
        if (privacy === PrivacyLevel.PUBLIC) return true;
        if (!viewerUserId) return false;
        if (privacy === PrivacyLevel.PRIVATE) return false;

        const viewer = await this.prisma.applicant.findUnique({
            where: {userId: viewerUserId},
        });
        if (!viewer) return false;
        if (viewer.id === target.id) return true;
        if (privacy === PrivacyLevel.CONTACTS) {
            return this.areContacts(target.id, viewer.id);
        }
        return false;
    }
}
