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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/CreateProject.dto';
import { UpdateProjectDto } from './dto/UpdateProject.dto';
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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/config/multer.config';
import { UpsertProjectTranslationDto } from './dto/UpsertProjectTranslations.dto';
import { AuthGuard } from '@/auth/guards/basic-auth.guard';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects with filters and pagination' })
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
    example: 9,
    type: 'number',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by project location',
    example: 'Batumi',
  })
  @ApiQuery({
    name: 'priceFrom',
    required: false,
    description: 'Minimum price filter',
    example: 50000,
    type: 'number',
  })
  @ApiQuery({
    name: 'priceTo',
    required: false,
    description: 'Maximum price filter',
    example: 200000,
    type: 'number',
  })
  @ApiQuery({
    name: 'partnerId',
    required: false,
    description: 'Filter by partner ID',
    example: 1,
    type: 'number',
  })
  @ApiQuery({
    name: 'public',
    required: false,
    description:
      'Filter by public visibility (defaults to true for client-facing)',
    example: true,
    type: 'boolean',
  })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  async findAll(
    @Query('lang') lang?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('location') location?: string,
    @Query('priceFrom') priceFrom?: string,
    @Query('priceTo') priceTo?: string,
    @Query('partnerId') partnerId?: string,
    @Query('public') isPublic?: string,
  ) {
    return this.projectsService.findAll({
      lang: lang || 'en',
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      location,
      priceFrom: priceFrom ? parseFloat(priceFrom) : undefined,
      priceTo: priceTo ? parseFloat(priceTo) : undefined,
      partnerId: partnerId ? parseInt(partnerId, 10) : undefined,
      public:
        isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'number' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code (e.g., en, ka, ru)',
    example: 'en',
  })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang?: string,
  ) {
    return this.projectsService.findOne(id, lang || 'en');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 409, description: 'Project already exists' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'gallery', maxCount: 20 },
      ],
      multerConfig('projects'),
    ),
  )
  @ApiBody({ type: CreateProjectDto })
  async createProject(
    @Body() dto: CreateProjectDto,
    @UploadedFiles()
    files?: {
      image?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
  ) {
    return this.projectsService.createProject(
      dto,
      files?.image?.[0],
      files?.gallery,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'gallery', maxCount: 20 },
      ],
      multerConfig('projects'),
    ),
  )
  @ApiBody({
    type: UpdateProjectDto,
    description: 'Project update data',
  })
  async updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
    @UploadedFiles()
    files?: {
      image?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
  ) {
    return this.projectsService.updateProject(
      id,
      dto,
      files?.image?.[0],
      files?.gallery,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async deleteProject(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.deleteProject(id);
  }

  @Delete(':id/gallery/:imageIndex')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a specific gallery image from project' })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'number' })
  @ApiParam({ name: 'imageIndex', description: 'Image index', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Gallery image deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Project or image not found' })
  async deleteGalleryImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageIndex', ParseIntPipe) imageIndex: number,
  ) {
    return this.projectsService.deleteGalleryImage(id, imageIndex);
  }

  @Get(':id/translations')
  @ApiOperation({ summary: 'Get all translations for a project' })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Translations retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getTranslations(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.getTranslations(id);
  }

  @Patch(':id/translations')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add or update a translation' })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Translation added/updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiBody({ type: UpsertProjectTranslationDto })
  async upsertTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertProjectTranslationDto,
  ) {
    return this.projectsService.upsertTranslation(
      id,
      dto.language,
      dto.projectName,
      dto.projectLocation,
    );
  }

  @Delete(':id/translations/:language')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a specific translation' })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'number' })
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
    return this.projectsService.deleteTranslation(id, language);
  }
}
