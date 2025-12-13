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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto } from './dto/CreateApartment.dto';
import { UpdateApartmentDto } from './dto/UpdateApartment.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/config/multer.config';
import { UpsertApartmentTranslationDto } from './dto/UpsertApartmentTranslation.dto';
import { AuthGuard } from '@/auth/guards/basic-auth.guard';

@ApiTags('Apartments')
@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all apartments with pagination' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code (e.g., en, ka, ru)',
    example: 'en',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
    type: 'number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
    type: 'number',
  })
  @ApiQuery({
    name: 'projectId',
    required: false,
    description: 'Filter by project ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Apartments retrieved successfully',
  })
  @Get()
  async findAll(
    @Query('lang') lang?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('projectId') projectId?: string,
    @Query('hotSale') hotSale?: string,
  ) {
    return this.apartmentsService.findAll({
      lang,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      hotSale:
        hotSale === 'true' ? true : hotSale === 'false' ? false : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get apartment by ID' })
  @ApiParam({ name: 'id', description: 'Apartment ID', type: 'number' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code (e.g., en, ka, ru)',
    example: 'en',
  })
  @ApiResponse({ status: 200, description: 'Apartment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Apartment not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang?: string,
  ) {
    return this.apartmentsService.findOne(id, lang || 'en');
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new apartment' })
  @ApiResponse({ status: 201, description: 'Apartment created successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig('apartments')))
  @ApiBody({ type: CreateApartmentDto })
  async createApartment(
    @Body() dto: CreateApartmentDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.apartmentsService.createApartment(dto, images);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an apartment' })
  @ApiParam({ name: 'id', description: 'Apartment ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Apartment updated successfully' })
  @ApiResponse({ status: 404, description: 'Apartment not found' })
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig('apartments')))
  @ApiBody({
    type: UpdateApartmentDto,
    description: 'Apartment update data',
  })
  async updateApartment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApartmentDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.apartmentsService.updateApartment(id, dto, images);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an apartment' })
  @ApiParam({ name: 'id', description: 'Apartment ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Apartment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Apartment not found' })
  async deleteApartment(@Param('id', ParseIntPipe) id: number) {
    return this.apartmentsService.deleteApartment(id);
  }

  @Delete(':id/images/:imageIndex')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a specific image from apartment' })
  @ApiParam({ name: 'id', description: 'Apartment ID', type: 'number' })
  @ApiParam({ name: 'imageIndex', description: 'Image index', type: 'number' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 404, description: 'Apartment or image not found' })
  async deleteImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageIndex', ParseIntPipe) imageIndex: number,
  ) {
    return this.apartmentsService.deleteImage(id, imageIndex);
  }

  @Get(':id/translations')
  @ApiOperation({ summary: 'Get all translations for an apartment' })
  @ApiParam({ name: 'id', description: 'Apartment ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Translations retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Apartment not found' })
  async getTranslations(@Param('id', ParseIntPipe) id: number) {
    return this.apartmentsService.getTranslations(id);
  }

  @Patch(':id/translations')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add or update a translation' })
  @ApiParam({ name: 'id', description: 'Apartment ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Translation added/updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Apartment not found' })
  @ApiBody({ type: UpsertApartmentTranslationDto })
  async upsertTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertApartmentTranslationDto,
  ) {
    return this.apartmentsService.upsertTranslation(
      id,
      dto.language,
      dto.description,
    );
  }

  @Delete(':id/translations/:language')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a specific translation' })
  @ApiParam({ name: 'id', description: 'Apartment ID', type: 'number' })
  @ApiParam({
    name: 'language',
    description: 'Language code (e.g., ka, ru)',
    example: 'ka',
  })
  @ApiResponse({ status: 200, description: 'Translation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Translation not found' })
  async deleteTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Param('language') language: string,
  ) {
    return this.apartmentsService.deleteTranslation(id, language);
  }
}
