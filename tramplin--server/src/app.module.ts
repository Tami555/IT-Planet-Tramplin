import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ThrottlerModule, ThrottlerGuard} from '@nestjs/throttler';
import {ServeStaticModule} from '@nestjs/serve-static';
import {APP_GUARD, APP_FILTER} from '@nestjs/core';
import {join} from 'path';

import {PrismaModule} from './prisma.module';
import {AuthModule} from './auth/auth.module';
import {FilesModule} from './files/files.module';
import {TagsModule} from './tags/tags.module';
import {OpportunitiesModule} from './opportunities/opportunities.module';
import {ApplicantsModule} from './applicants/applicants.module';
import {EmployersModule} from './employers/employers.module';
import {CuratorsModule} from './curators/curators.module';
import {GlobalExceptionFilter} from './common/filters/global-exception.filter';

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        ThrottlerModule.forRoot([{ttl: 60000, limit: 100}]),
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads'),
            serveRoot: '/uploads',
            serveStaticOptions: {index: false},
        }),
        PrismaModule,
        AuthModule,
        FilesModule,
        TagsModule,
        OpportunitiesModule,
        ApplicantsModule,
        EmployersModule,
        CuratorsModule,
    ],
    providers: [
        {provide: APP_GUARD, useClass: ThrottlerGuard},
        {provide: APP_FILTER, useClass: GlobalExceptionFilter},
    ],
})
export class AppModule {
}
