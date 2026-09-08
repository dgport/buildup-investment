import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AdminGuard } from '@/auth/guards/admin.guard';
import { multerConfig } from '@/common/config/multer.config';
import { DevelopersService } from './developers.service';
import { CreateDeveloperDto, UpdateDeveloperDto } from './dto/developer.dto';

@ApiTags('Developers')
@Controller('developers')
export class DevelopersController {
  constructor(private readonly developers: DevelopersService) {}

  // ─── Public ───────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Published developers with project counts' })
  @ApiQuery({ name: 'lang', required: false, example: 'ka' })
  findAll(@Query('lang') lang = 'en') {
    return this.developers.findAll(lang);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'All developers incl. unpublished (admin)' })
  findAllAdmin(@Query('lang') lang = 'en') {
    return this.developers.findAll(lang, true);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'One developer with all translations (admin)' })
  findOneAdmin(@Param('id') id: string, @Query('lang') lang = 'en') {
    return this.developers.findOne(id, lang, true);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create developer (admin)' })
  create(@Body() dto: CreateDeveloperDto) {
    return this.developers.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update developer (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateDeveloperDto) {
    return this.developers.update(id, dto);
  }

  @Post(':id/logo')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload / replace developer logo (admin)' })
  @UseInterceptors(FileInterceptor('logo', multerConfig('developers')))
  setLogo(@Param('id') id: string, @UploadedFile() logo?: Express.Multer.File) {
    return this.developers.setLogo(id, logo);
  }

  @Delete(':id/logo')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove developer logo (admin)' })
  removeLogo(@Param('id') id: string) {
    return this.developers.removeLogo(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete developer without projects (admin)' })
  remove(@Param('id') id: string) {
    return this.developers.remove(id);
  }

  // Public detail last so "admin/..." routes win
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Published developer by id or slug' })
  @ApiQuery({ name: 'lang', required: false, example: 'ka' })
  findOne(@Param('idOrSlug') idOrSlug: string, @Query('lang') lang = 'en') {
    return this.developers.findOne(idOrSlug, lang);
  }
}
