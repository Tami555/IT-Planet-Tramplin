import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import {Role, VerificationStatus} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {PrismaService} from '@/prisma.service';
import {
    CreateCuratorDto,
    CuratorUserFilterDto,
    UpdateUserStatusDto,
    VerifyEmployerDto,
} from './dto/curator.dto';
import {buildPaginatedResponse} from '@/common/dto/pagination.dto';

@Injectable()
export class CuratorsService {
    constructor(private prisma: PrismaService) {
    }

    async createCurator(dto: CreateCuratorDto, adminUserId: string) {
        await this.ensureAdmin(adminUserId);

        const existing = await this.prisma.user.findUnique({
            where: {email: dto.email},
        });
        if (existing) {
            throw new ConflictException(
                'Пользователь с таким email уже зарегистрирован',
            );
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        return this.prisma.user.create({
            data: {
                email: dto.email,
                displayName: dto.displayName,
                passwordHash,
                role: Role.CURATOR,
                curator: {
                    create: {isAdmin: dto.isAdmin ?? false},
                },
            },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                createdAt: true,
                curator: {select: {id: true, isAdmin: true}},
            },
        });
    }

    async getCurators(adminUserId: string) {
        await this.ensureAdmin(adminUserId);

        return this.prisma.user.findMany({
            where: {role: Role.CURATOR},
            select: {
                id: true,
                email: true,
                displayName: true,
                isActive: true,
                createdAt: true,
                curator: {select: {id: true, isAdmin: true}},
            },
            orderBy: {createdAt: 'asc'},
        });
    }

    async getUsers(filter: CuratorUserFilterDto) {
        const {page = 1, limit = 20} = filter;
        const skip = (page - 1) * limit;

        const where: any = {
            ...(filter.role && {role: filter.role}),
            ...(filter.search && {
                OR: [
                    {email: {contains: filter.search, mode: 'insensitive'}},
                    {displayName: {contains: filter.search, mode: 'insensitive'}},
                ],
            }),
        };

        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: {createdAt: 'desc'},
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    applicant: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            university: true,
                        },
                    },
                    employer: {
                        select: {
                            id: true,
                            companyName: true,
                            verificationStatus: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({where}),
        ]);

        return buildPaginatedResponse(data, total, page, limit);
    }

    async getUserById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: {id},
            include: {
                applicant: true,
                employer: true,
                curator: true,
            },
        });
        if (!user) throw new NotFoundException('Пользователь не найден');
        const {passwordHash, ...safeUser} = user as any;
        return safeUser;
    }

    async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
        const user = await this.prisma.user.findUnique({where: {id: userId}});
        if (!user) throw new NotFoundException('Пользователь не найден');

        return this.prisma.user.update({
            where: {id: userId},
            data: {isActive: dto.isActive},
            select: {
                id: true,
                email: true,
                displayName: true,
                isActive: true,
                role: true,
            },
        });
    }

    async getPendingVerifications(page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.employer.findMany({
                where: {verificationStatus: VerificationStatus.PENDING},
                skip,
                take: limit,
                orderBy: {createdAt: 'asc'},
                include: {
                    user: {select: {id: true, email: true, displayName: true}},
                },
            }),
            this.prisma.employer.count({
                where: {verificationStatus: VerificationStatus.PENDING},
            }),
        ]);

        return buildPaginatedResponse(data, total, page, limit);
    }

    async verifyEmployer(
        employerId: string,
        dto: VerifyEmployerDto,
        curatorUserId: string,
    ) {
        const employer = await this.prisma.employer.findUnique({
            where: {id: employerId},
        });
        if (!employer) throw new NotFoundException('Работодатель не найден');

        if (employer.verificationStatus === VerificationStatus.VERIFIED) {
            throw new BadRequestException('Компания уже верифицирована');
        }

        const curator = await this.prisma.curator.findUnique({
            where: {userId: curatorUserId},
        });

        return this.prisma.employer.update({
            where: {id: employerId},
            data: {
                verificationStatus:
                    dto.status === 'VERIFIED'
                        ? VerificationStatus.VERIFIED
                        : VerificationStatus.REJECTED,
                verificationNote: dto.note,
                verifiedAt:
                    dto.status === 'VERIFIED' ? new Date() : null,
                verifiedBy: dto.status === 'VERIFIED' ? curator?.id : null,
            },
        });
    }

    async getPendingOpportunities(page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.opportunity.findMany({
                where: {status: 'MODERATION'},
                skip,
                take: limit,
                orderBy: {createdAt: 'asc'},
                include: {
                    employer: {
                        select: {id: true, companyName: true, verificationStatus: true},
                    },
                    tags: {include: {tag: true}},
                },
            }),
            this.prisma.opportunity.count({where: {status: 'MODERATION'}}),
        ]);

        return buildPaginatedResponse(data, total, page, limit);
    }

    async getApplicantDetail(applicantId: string) {
        const applicant = await this.prisma.applicant.findUnique({
            where: {id: applicantId},
            include: {
                user: {
                    select: {id: true, email: true, displayName: true, isActive: true},
                },
                applications: {
                    take: 5,
                    orderBy: {createdAt: 'desc'},
                    include: {
                        opportunity: {select: {id: true, title: true}},
                    },
                },
            },
        });
        if (!applicant) throw new NotFoundException('Соискатель не найден');
        return applicant;
    }

    async getEmployerDetail(employerId: string) {
        const employer = await this.prisma.employer.findUnique({
            where: {id: employerId},
            include: {
                user: {
                    select: {id: true, email: true, displayName: true, isActive: true},
                },
                opportunities: {
                    take: 5,
                    orderBy: {createdAt: 'desc'},
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!employer) throw new NotFoundException('Работодатель не найден');
        return employer;
    }

    async getStats() {
        const [
            totalUsers,
            totalApplicants,
            totalEmployers,
            verifiedEmployers,
            pendingVerifications,
            totalOpportunities,
            activeOpportunities,
            pendingModeration,
            totalApplications,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.applicant.count(),
            this.prisma.employer.count(),
            this.prisma.employer.count({
                where: {verificationStatus: VerificationStatus.VERIFIED},
            }),
            this.prisma.employer.count({
                where: {verificationStatus: VerificationStatus.PENDING},
            }),
            this.prisma.opportunity.count(),
            this.prisma.opportunity.count({where: {status: 'ACTIVE'}}),
            this.prisma.opportunity.count({where: {status: 'MODERATION'}}),
            this.prisma.application.count(),
        ]);

        return {
            users: {total: totalUsers, applicants: totalApplicants, employers: totalEmployers},
            verification: {verified: verifiedEmployers, pending: pendingVerifications},
            opportunities: {
                total: totalOpportunities,
                active: activeOpportunities,
                pendingModeration,
            },
            applications: {total: totalApplications},
        };
    }

    private async ensureAdmin(userId: string) {
        const curator = await this.prisma.curator.findUnique({where: {userId}});
        if (!curator?.isAdmin) {
            throw new ForbiddenException(
                'Только администратор может управлять учётными записями кураторов',
            );
        }
    }
}
