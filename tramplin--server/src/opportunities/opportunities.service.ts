import {
    Injectable,
    NotFoundException,
    ForbiddenException
} from '@nestjs/common';
import {OpportunityStatus, Role, WorkFormat} from '@prisma/client';
import {PrismaService} from '@/prisma.service';
import {
    CreateOpportunityDto,
    UpdateOpportunityDto,
    OpportunityFilterDto,
    ModerationDto,
} from './dto/opportunity.dto';
import {FilesService} from '@/files/files.service';
import {buildPaginatedResponse} from '@/common/dto/pagination.dto';

@Injectable()
export class OpportunitiesService {
    constructor(
        private prisma: PrismaService,
        private filesService: FilesService,
    ) {
    }

    async findAll(filter: OpportunityFilterDto) {
        const {page = 1, limit = 20} = filter;
        const skip = (page - 1) * limit;

        const where: any = {
            status: OpportunityStatus.ACTIVE,
            ...(filter.type && {type: filter.type}),
            ...(filter.format && {format: filter.format}),
            ...(filter.city && {city: {contains: filter.city, mode: 'insensitive'}}),
            ...(filter.search && {
                OR: [
                    {title: {contains: filter.search, mode: 'insensitive'}},
                    {description: {contains: filter.search, mode: 'insensitive'}},
                ],
            }),
            ...((filter.salaryMin || filter.salaryMax) && {
                AND: [
                    ...(filter.salaryMin ? [{salaryTo: {gte: filter.salaryMin}}] : []),
                    ...(filter.salaryMax ? [{salaryFrom: {lte: filter.salaryMax}}] : []),
                ],
            }),
            ...(filter.tagIds?.length && {
                tags: {some: {tagId: {in: filter.tagIds}}},
            }),
        };

        const [data, total] = await Promise.all([
            this.prisma.opportunity.findMany({
                where,
                skip,
                take: limit,
                orderBy: {publishedAt: 'desc'},
                include: {
                    employer: {
                        select: {
                            id: true,
                            companyName: true,
                            logoUrl: true,
                            city: true,
                        },
                    },
                    tags: {include: {tag: true}},
                },
            }),
            this.prisma.opportunity.count({where}),
        ]);

        return buildPaginatedResponse(data, total, page, limit);
    }

    async findForMap(filter: Omit<OpportunityFilterDto, 'page' | 'limit'>) {
        const where: any = {
            status: OpportunityStatus.ACTIVE,
            OR: [
                {latitude: {not: null}, longitude: {not: null}},
                {format: WorkFormat.REMOTE},
            ],
            ...(filter.type && {type: filter.type}),
            ...(filter.format && {format: filter.format}),
            ...(filter.city && {city: {contains: filter.city, mode: 'insensitive'}}),
            ...(filter.search && {
                OR: [
                    {title: {contains: filter.search, mode: 'insensitive'}},
                    {description: {contains: filter.search, mode: 'insensitive'}},
                ],
            }),
        };

        return this.prisma.opportunity.findMany({
            where,
            select: {
                id: true,
                title: true,
                type: true,
                format: true,
                salaryFrom: true,
                salaryTo: true,
                currency: true,
                city: true,
                address: true,
                latitude: true,
                longitude: true,
                employer: {
                    select: {id: true, companyName: true, logoUrl: true},
                },
                tags: {
                    take: 3,
                    include: {tag: {select: {id: true, name: true, category: true}}},
                },
            },
            take: 500,
        });
    }

    async findOne(id: string) {
        const opportunity = await this.prisma.opportunity.findFirst({
            where: {id, status: OpportunityStatus.ACTIVE},
            include: {
                employer: {
                    select: {
                        id: true,
                        companyName: true,
                        description: true,
                        industry: true,
                        websiteUrl: true,
                        socialLinks: true,
                        logoUrl: true,
                        city: true,
                    },
                },
                tags: {include: {tag: true}},
                _count: {select: {applications: true}},
            },
        });

        if (!opportunity) {
            throw new NotFoundException('Возможность не найдена или недоступна');
        }

        return opportunity;
    }

    async create(dto: CreateOpportunityDto, userId: string) {
        const employer = await this.getVerifiedEmployer(userId);

        const {tagIds, ...data} = dto;

        return this.prisma.opportunity.create({
            data: {
                ...data,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
                eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
                employerId: employer.id,
                status: OpportunityStatus.MODERATION,
                tags: tagIds?.length
                    ? {create: tagIds.map((tagId) => ({tagId}))}
                    : undefined,
            },
            include: {tags: {include: {tag: true}}},
        });
    }

    async update(id: string, dto: UpdateOpportunityDto, userId: string, role: Role) {
        const opportunity = await this.findOpportunityForEdit(id, userId, role);

        const {tagIds, ...data} = dto;

        return this.prisma.opportunity.update({
            where: {id},
            data: {
                ...data,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
                eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,

                ...(role !== Role.CURATOR && {status: OpportunityStatus.MODERATION}),
                ...(tagIds && {
                    tags: {
                        deleteMany: {},
                        create: tagIds.map((tagId) => ({tagId})),
                    },
                }),
            },
            include: {tags: {include: {tag: true}}},
        });
    }

    async uploadMedia(
        id: string,
        files: Express.Multer.File[],
        userId: string,
        role: Role,
    ) {
        await this.findOpportunityForEdit(id, userId, role);
        const urls = await this.filesService.saveMultipleFiles(files, 'media');

        return this.prisma.opportunity.update({
            where: {id},
            data: {mediaUrls: {push: urls}},
        });
    }

    async remove(id: string, userId: string, role: Role) {
        await this.findOpportunityForEdit(id, userId, role);
        await this.prisma.opportunity.delete({where: {id}});
        return {message: 'Возможность успешно удалена'};
    }

    async moderate(id: string, dto: ModerationDto, curatorId: string) {
        const opportunity = await this.prisma.opportunity.findUnique({where: {id}});
        if (!opportunity) throw new NotFoundException('Возможность не найдена');

        const newStatus =
            dto.status === 'ACTIVE'
                ? OpportunityStatus.ACTIVE
                : OpportunityStatus.CLOSED;

        return this.prisma.opportunity.update({
            where: {id},
            data: {
                status: newStatus,
                moderationNote: dto.moderationNote,
                ...(newStatus === OpportunityStatus.ACTIVE && {publishedAt: new Date()}),
            },
        });
    }

    async findPendingModeration(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.opportunity.findMany({
                where: {status: OpportunityStatus.MODERATION},
                skip,
                take: limit,
                orderBy: {createdAt: 'asc'},
                include: {
                    employer: {select: {id: true, companyName: true}},
                    tags: {include: {tag: true}},
                },
            }),
            this.prisma.opportunity.count({where: {status: OpportunityStatus.MODERATION}}),
        ]);
        return buildPaginatedResponse(data, total, page, limit);
    }

    async findByEmployer(employerId: string, status?: OpportunityStatus, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.opportunity.findMany({
                where: {employerId, ...(status && {status})},
                skip,
                take: limit,
                orderBy: {createdAt: 'desc'},
                include: {
                    tags: {include: {tag: true}},
                    _count: {select: {applications: true}},
                },
            }),
            this.prisma.opportunity.count({
                where: {employerId, ...(status && {status})},
            }),
        ]);
        return buildPaginatedResponse(data, total, page, limit);
    }

    private async getVerifiedEmployer(userId: string) {
        const employer = await this.prisma.employer.findUnique({where: {userId}});
        if (!employer) throw new NotFoundException('Профиль работодателя не найден');
        if (employer.verificationStatus !== 'VERIFIED') {
            throw new ForbiddenException(
                'Для публикации вакансий необходима верификация компании. Обратитесь к куратору платформы',
            );
        }
        return employer;
    }

    private async findOpportunityForEdit(id: string, userId: string, role: Role) {
        const opportunity = await this.prisma.opportunity.findUnique({
            where: {id},
            include: {employer: true},
        });

        if (!opportunity) throw new NotFoundException('Возможность не найдена');

        if (role === Role.CURATOR) return opportunity;

        if (opportunity.employer.userId !== userId) {
            throw new ForbiddenException('Вы не можете редактировать чужую вакансию');
        }

        return opportunity;
    }
}
