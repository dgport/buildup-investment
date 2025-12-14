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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
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
import { UpsertPropertyTranslationDto } from './dto/UpsertPropertyTranslation.dto';
import { CreatePropertyDto } from './dto/CreateProperty.dto';
import { UpdatePropertyDto } from './dto/UpdateProperty.dto';
import { AuthGuard } from '@/auth/guards/basic-auth.guard';

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
    name: 'address',
    required: false,
    description: 'Filter by address (supports partial match)',
    example: 'Batumi',
  })
  @ApiQuery({
    name: 'priceFrom',
    required: false,
    description: 'Minimum price',
    type: 'number',
  })
  @ApiQuery({
    name: 'priceTo',
    required: false,
    description: 'Maximum price',
    type: 'number',
  })
  @ApiQuery({
    name: 'hotSale',
    required: false,
    description: 'Filter hot sale properties',
    type: 'boolean',
  })
  @ApiQuery({
    name: 'public',
    required: false,
    description: 'Filter public/private properties',
    type: 'boolean',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by property status',
    enum: ['OLD_BUILDING', 'NEW_BUILDING', 'UNDER_CONSTRUCTION'],
  })
  @ApiQuery({
    name: 'dealType',
    required: false,
    description: 'Filter by deal type',
    enum: ['RENT', 'SALE', 'DAILY_RENT'],
  })
  @ApiQuery({
    name: 'areaFrom',
    required: false,
    description: 'Minimum total area',
    type: 'number',
  })
  @ApiQuery({
    name: 'areaTo',
    required: false,
    description: 'Maximum total area',
    type: 'number',
  })
  @ApiQuery({
    name: 'rooms',
    required: false,
    description: 'Number of rooms (5+ for 5 or more)',
    type: 'number',
  })
  @ApiQuery({
    name: 'bedrooms',
    required: false,
    description: 'Number of bedrooms (4+ for 4 or more)',
    type: 'number',
  })
  @ApiQuery({
    name: 'bathrooms',
    required: false,
    description: 'Number of bathrooms (3+ for 3 or more)',
    type: 'number',
  })
  @ApiQuery({
    name: 'condition',
    required: false,
    description: 'Filter by property condition',
    enum: ['NEWLY_RENOVATED', 'OLD_RENOVATED', 'REPAIRING'],
  })
  @ApiQuery({
    name: 'heating',
    required: false,
    description: 'Filter by heating type',
    enum: ['CENTRAL_HEATING', 'INDIVIDUAL', 'GAS', 'ELECTRIC', 'NONE'],
  })
  @ApiQuery({
    name: 'parking',
    required: false,
    description: 'Filter by parking type',
    enum: ['PARKING_SPACE', 'GARAGE', 'OPEN_LOT', 'NONE'],
  })
  @ApiQuery({
    name: 'hasConditioner',
    required: false,
    description: 'Has air conditioner',
    type: 'boolean',
  })
  @ApiQuery({
    name: 'hasFurniture',
    required: false,
    description: 'Has furniture',
    type: 'boolean',
  })
  @ApiQuery({
    name: 'hasBalcony',
    required: false,
    description: 'Has balcony',
    type: 'boolean',
  })
  @ApiQuery({
    name: 'hasInternet',
    required: false,
    description: 'Has internet',
    type: 'boolean',
  })
  @ApiQuery({
    name: 'hasNaturalGas',
    required: false,
    description: 'Has natural gas',
    type: 'boolean',
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
    @Query('address') address?: string,
    @Query('priceFrom') priceFrom?: string,
    @Query('priceTo') priceTo?: string,
    @Query('hotSale') hotSale?: string,
    @Query('public') publicParam?: string,
    @Query('status') status?: string,
    @Query('dealType') dealType?: string,
    @Query('areaFrom') areaFrom?: string,
    @Query('areaTo') areaTo?: string,
    @Query('rooms') rooms?: string,
    @Query('bedrooms') bedrooms?: string,
    @Query('bathrooms') bathrooms?: string,
    @Query('condition') condition?: string,
    @Query('heating') heating?: string,
    @Query('parking') parking?: string,
    @Query('hasConditioner') hasConditioner?: string,
    @Query('hasFurniture') hasFurniture?: string,
    @Query('hasBalcony') hasBalcony?: string,
    @Query('hasInternet') hasInternet?: string,
    @Query('hasNaturalGas') hasNaturalGas?: string,
  ) {
    return this.propertiesService.findAll({
      lang,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      propertyType,
      address,
      priceFrom: priceFrom ? parseInt(priceFrom, 10) : undefined,
      priceTo: priceTo ? parseInt(priceTo, 10) : undefined,
      hotSale: hotSale === 'true',
      public:
        publicParam === 'true'
          ? true
          : publicParam === 'false'
            ? false
            : undefined,
      status,
      dealType,
      areaFrom: areaFrom ? parseInt(areaFrom, 10) : undefined,
      areaTo: areaTo ? parseInt(areaTo, 10) : undefined,
      rooms: rooms ? parseInt(rooms, 10) : undefined,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms, 10) : undefined,
      condition,
      heating,
      parking,
      hasConditioner: hasConditioner === 'true',
      hasFurniture: hasFurniture === 'true',
      hasBalcony: hasBalcony === 'true',
      hasInternet: hasInternet === 'true',
      hasNaturalGas: hasNaturalGas === 'true',
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a property' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async deleteProperty(@Param('id') id: string) {
    return this.propertiesService.deleteProperty(id);
  }

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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
      dto.address,
      dto.description,
    );
  }

  @Delete(':id/translations/:language')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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

  @Delete(':id/images/:imageId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
