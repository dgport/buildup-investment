import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { DevelopersController } from './developers.controller';
import { DevelopersService } from './developers.service';

@Module({
  imports: [AuthModule],
  controllers: [DevelopersController, ProjectsController],
  providers: [ProjectsService, DevelopersService],
})
export class ProjectsModule {}
