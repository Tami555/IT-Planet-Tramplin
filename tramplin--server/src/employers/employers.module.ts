import {Module} from '@nestjs/common';
import {EmployersService} from './employers.service';
import {EmployersController} from './employers.controller';
import {FilesModule} from '@/files/files.module';
import {OpportunitiesModule} from '@/opportunities/opportunities.module';

@Module({
    imports: [FilesModule, OpportunitiesModule],
    controllers: [EmployersController],
    providers: [EmployersService],
    exports: [EmployersService],
})
export class EmployersModule {
}
