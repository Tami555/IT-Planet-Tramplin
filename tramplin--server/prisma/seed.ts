import {PrismaClient, Role} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Запуск сидирования базы данных...');

    const systemTags = [
        {name: 'Python', category: 'technology'},
        {name: 'JavaScript', category: 'technology'},
        {name: 'TypeScript', category: 'technology'},
        {name: 'Java', category: 'technology'},
        {name: 'C++', category: 'technology'},
        {name: 'C#', category: 'technology'},
        {name: 'Go', category: 'technology'},
        {name: 'Rust', category: 'technology'},
        {name: 'SQL', category: 'technology'},
        {name: 'PostgreSQL', category: 'technology'},
        {name: 'MySQL', category: 'technology'},
        {name: 'MongoDB', category: 'technology'},
        {name: 'Redis', category: 'technology'},
        {name: 'Docker', category: 'technology'},
        {name: 'Kubernetes', category: 'technology'},
        {name: 'React', category: 'technology'},
        {name: 'Vue.js', category: 'technology'},
        {name: 'Angular', category: 'technology'},
        {name: 'Node.js', category: 'technology'},
        {name: 'NestJS', category: 'technology'},
        {name: 'Django', category: 'technology'},
        {name: 'FastAPI', category: 'technology'},
        {name: 'Spring Boot', category: 'technology'},
        {name: 'Git', category: 'technology'},
        {name: 'Linux', category: 'technology'},
        {name: 'AWS', category: 'technology'},
        {name: 'Machine Learning', category: 'technology'},
        {name: 'Data Science', category: 'technology'},
        {name: 'DevOps', category: 'technology'},
        {name: 'CI/CD', category: 'technology'},

        {name: 'Intern', category: 'level'},
        {name: 'Junior', category: 'level'},
        {name: 'Middle', category: 'level'},
        {name: 'Senior', category: 'level'},

        {name: 'Полная занятость', category: 'employment'},
        {name: 'Частичная занятость', category: 'employment'},
        {name: 'Проектная работа', category: 'employment'},
        {name: 'Стажировка', category: 'employment'},
        {name: 'Волонтёрство', category: 'employment'},
    ];

    for (const tag of systemTags) {
        await prisma.tag.upsert({
            where: {name: tag.name},
            update: {},
            create: tag,
        });
    }
    console.log(`Создано ${systemTags.length} системных тегов`);

    const adminPassword = await bcrypt.hash('Admin@2026!', 12);
    const adminUser = await prisma.user.upsert({
        where: {email: 'admin@tramplin.ru'},
        update: {},
        create: {
            email: 'admin@tramplin.ru',
            displayName: 'Администратор',
            passwordHash: adminPassword,
            role: Role.CURATOR,
            curator: {
                create: {
                    isAdmin: true,
                },
            },
        },
    });

    console.log(`Администратор создан: ${adminUser.email}`);
    console.log(`Пароль: Admin@2026!`);
    console.log('\nСидирование завершено успешно!');
}

main()
    .catch((e) => {
        console.error('Ошибка сидирования:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
