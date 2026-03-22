import {
    Injectable,
    ConflictException,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import {Role} from '@prisma/client';
import {PrismaService} from '@/prisma.service';
import {CreateTagDto, TagFilterDto} from './dto/tag.dto';

@Injectable()
export class TagsService {
    constructor(private prisma: PrismaService) {
    }

    async findAll(filter: TagFilterDto) {
        return this.prisma.tag.findMany({
            where: {
                ...(filter.category && {category: filter.category}),
                ...(filter.search && {
                    name: {contains: filter.search, mode: 'insensitive'},
                }),
            },
            orderBy: [{category: 'asc'}, {name: 'asc'}],
        });
    }

    async create(dto: CreateTagDto, userId: string, userRole: Role) {
        const existing = await this.prisma.tag.findUnique({
            where: {name: dto.name},
        });
        if (existing) {
            throw new ConflictException(`Тег с названием "${dto.name}" уже существует`);
        }

        return this.prisma.tag.create({
            data: {
                name: dto.name,
                category: dto.category,
                createdById: userRole === Role.CURATOR ? null : userId,
            },
        });
    }

    async remove(id: string, userRole: Role) {
        const tag = await this.prisma.tag.findUnique({where: {id}});
        if (!tag) {
            throw new NotFoundException('Тег не найден');
        }

        if (!tag.createdById && userRole !== Role.CURATOR) {
            throw new ForbiddenException('Системные теги может удалять только куратор');
        }

        await this.prisma.tag.delete({where: {id}});
        return {message: 'Тег успешно удалён'};
    }
}
