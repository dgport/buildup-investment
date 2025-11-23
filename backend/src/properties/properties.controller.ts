import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import {
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
import { UpsertPropertyTranslationDto } from './dto/UpsertPropertyTranslation.dto';
import { CreatePropertyDto } from './dto/CreateProperty.dto';
import { UpdatePropertyDto } from './dto/UpdateProperty.dto';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all properties with pagination and filters' })
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
    name: 'propertyType',
    required: false,
    description: 'Filter by property type',
    enum: ['APARTMENT', 'VILLA', 'COMMERCIAL', 'LAND', 'HOTEL'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by property status',
    enum: ['OLD_BUILDING', 'NEW_BUILDING', 'UNDER_CONSTRUCTION'],
  })
  @ApiResponse({
    status: 200,
    description: 'Properties retrieved successfully',
  })
  async findAll(
    @Query('lang') lang?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('propertyType') propertyType?: string,
    @Query('status') status?: string,
  ) {
    return this.propertiesService.findAll({
      lang,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      propertyType,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'string' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code',
    example: 'en',
  })
  @ApiResponse({ status: 200, description: 'Property retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findOne(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.propertiesService.findOne(id, lang);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  @UseInterceptors(FilesInterceptor('images', 20, multerConfig('properties')))
  @ApiBody({ type: CreatePropertyDto })
  async createProperty(
    @Body() dto: CreatePropertyDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.propertiesService.createProperty(dto, images);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a property' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Property updated successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @UseInterceptors(FilesInterceptor('images', 20, multerConfig('properties')))
  @ApiBody({ type: UpdatePropertyDto })
  async updateProperty(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.propertiesService.updateProperty(id, dto, images);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async deleteProperty(@Param('id') id: string) {
    return this.propertiesService.deleteProperty(id);
  }

  // Translation endpoints
  @Get(':id/translations')
  @ApiOperation({ summary: 'Get all translations for a property' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Translations retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async getTranslations(@Param('id') id: string) {
    return this.propertiesService.getTranslations(id);
  }

  @Patch(':id/translations')
  @ApiOperation({ summary: 'Add or update a translation' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Translation added/updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiBody({ type: UpsertPropertyTranslationDto })
  async upsertTranslation(
    @Param('id') id: string,
    @Body() dto: UpsertPropertyTranslationDto,
  ) {
    return this.propertiesService.upsertTranslation(
      id,
      dto.language,
      dto.title,
      dto.description,
    );
  }

  @Delete(':id/translations/:language')
  @ApiOperation({ summary: 'Delete a specific translation' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'string' })
  @ApiParam({
    name: 'language',
    description: 'Language code (e.g., ka, ru)',
    example: 'ka',
  })
  @ApiResponse({ status: 200, description: 'Translation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Translation not found' })
  async deleteTranslation(
    @Param('id') id: string,
    @Param('language') language: string,
  ) {
    return this.propertiesService.deleteTranslation(id, language);
  }

  // Gallery image endpoints
  @Delete(':id/images/:imageId')
  @ApiOperation({ summary: 'Delete a gallery image' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'string' })
  @ApiParam({ name: 'imageId', description: 'Image ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async deleteGalleryImage(
    @Param('id') id: string,
    @Param('imageId') imageId: number,
  ) {
    return this.propertiesService.deleteGalleryImage(id, +imageId);
  }
}
