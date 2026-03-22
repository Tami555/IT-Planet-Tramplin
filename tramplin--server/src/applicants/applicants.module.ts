import { Module } from '@nestjs/common';
import { ApplicantsService } from './applicants.service';
import { ApplicantsController } from './applicants.controller';
import { FilesModule } from '@/files/files.module';

@Module({
  imports: [FilesModule],
  controllers: [ApplicantsController],
  providers: [ApplicantsService],
  exports: [ApplicantsService],
})
export class ApplicantsModule {}
