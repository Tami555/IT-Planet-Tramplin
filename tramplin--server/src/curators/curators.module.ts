import {Module} from '@nestjs/common';
import {CuratorsService} from './curators.service';
import {CuratorsController} from './curators.controller';
import {OpportunitiesModule} from '@/opportunities/opportunities.module';

@Module({
    imports: [OpportunitiesModule],
    controllers: [CuratorsController],
    providers: [CuratorsService],
})
export class CuratorsModule {
}
