import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HomepageSlidesService } from './homepage-slides.service';

import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/config/multer.config';

import { AuthGuard } from '@/auth/guards/basic-auth.guard';
import { UpdateHomepageSlideDto } from './dto/UpdateHomepageSlides.dto';
import { UpsertSlideTranslationDto } from './dto/UpsertTranslations.dto';
import { CreateHomepageSlideDto } from './dto/CreateHompageSlides.dto';

@ApiTags('Homepage Slides')
@Controller('homepage-slides')
export class HomepageSlidesController {
  constructor(private readonly slidesService: HomepageSlidesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active slides for homepage slideshow' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code (e.g., en, ka, ru)',
    example: 'en',
  })
  @ApiResponse({ status: 200, description: 'Slides retrieved successfully' })
  async findAll(@Query('lang') lang?: string) {
    return this.slidesService.findAll(lang);
  }

  @Get('admin')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all slides (admin only, includes inactive)' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code (e.g., en, ka, ru)',
    example: 'en',
  })
  @ApiResponse({ status: 200, description: 'Slides retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllAdmin(@Query('lang') lang?: string) {
    return this.slidesService.findAllAdmin(lang);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single slide by ID' })
  @ApiParam({ name: 'id', description: 'Slide ID', type: 'number' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code (e.g., en, ka, ru)',
    example: 'en',
  })
  @ApiResponse({ status: 200, description: 'Slide retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Slide not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang?: string,
  ) {
    return this.slidesService.findOne(id, lang);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new homepage slide' })
  @ApiResponse({ status: 201, description: 'Slide created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('image', multerConfig('homepage-slides')))
  @ApiBody({ type: CreateHomepageSlideDto })
  async createSlide(
    @Body() dto: CreateHomepageSlideDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.slidesService.createSlide(dto, image);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a homepage slide' })
  @ApiParam({ name: 'id', description: 'Slide ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Slide updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Slide not found' })
  @UseInterceptors(FileInterceptor('image', multerConfig('homepage-slides')))
  @ApiBody({ type: UpdateHomepageSlideDto })
  async updateSlide(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHomepageSlideDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.slidesService.updateSlide(id, dto, image);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a homepage slide' })
  @ApiParam({ name: 'id', description: 'Slide ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Slide deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Slide not found' })
  async deleteSlide(@Param('id', ParseIntPipe) id: number) {
    return this.slidesService.deleteSlide(id);
  }

  @Get(':id/translations')
  @ApiOperation({ summary: 'Get all translations for a slide' })
  @ApiParam({ name: 'id', description: 'Slide ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Translations retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Slide not found' })
  async getTranslations(@Param('id', ParseIntPipe) id: number) {
    return this.slidesService.getTranslations(id);
  }

  @Patch(':id/translations')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add or update a translation' })
  @ApiParam({ name: 'id', description: 'Slide ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Translation added/updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Slide not found' })
  @ApiBody({ type: UpsertSlideTranslationDto })
  async upsertTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertSlideTranslationDto,
  ) {
    return this.slidesService.upsertTranslation(id, dto.language, dto.title);
  }

  @Delete(':id/translations/:language')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a specific translation' })
  @ApiParam({ name: 'id', description: 'Slide ID', type: 'number' })
  @ApiParam({
    name: 'language',
    description: 'Language code (e.g., ka, ru)',
    example: 'ka',
  })
  @ApiResponse({ status: 200, description: 'Translation deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Translation not found' })
  async deleteTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Param('language') language: string,
  ) {
    return this.slidesService.deleteTranslation(id, language);
  }
}
