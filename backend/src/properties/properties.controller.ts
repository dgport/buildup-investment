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
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UnauthorizedException,
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
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Region } from '@prisma/client';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // ─── Public Endpoints ─────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get all approved public properties with filters' })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 })
  @ApiQuery({ name: 'externalId', required: false, example: '591595' })
  @ApiQuery({ name: 'location', required: false, example: 'Batumi' })
  @ApiQuery({ name: 'region', required: false, enum: Region })
  @ApiQuery({
    name: 'propertyType',
    required: false,
    enum: ['APARTMENT', 'VILLA', 'COMMERCIAL', 'LAND', 'HOTEL'],
  })
  @ApiQuery({
    name: 'dealType',
    required: false,
    enum: ['RENT', 'SALE', 'DAILY_RENT'],
  })
  @ApiQuery({ name: 'priceFrom', required: false, type: 'number' })
  @ApiQuery({ name: 'priceTo', required: false, type: 'number' })
  @ApiQuery({ name: 'areaFrom', required: false, type: 'number' })
  @ApiQuery({ name: 'areaTo', required: false, type: 'number' })
  @ApiQuery({ name: 'rooms', required: false, type: 'number' })
  @ApiQuery({ name: 'bedrooms', required: false, type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Properties retrieved successfully',
  })
  async findAll(
    @Query('lang') lang?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('externalId') externalId?: string,
    @Query('location') location?: string,
    @Query('region') region?: string,
    @Query('propertyType') propertyType?: string,
    @Query('dealType') dealType?: string,
    @Query('priceFrom') priceFrom?: string,
    @Query('priceTo') priceTo?: string,
    @Query('areaFrom') areaFrom?: string,
    @Query('areaTo') areaTo?: string,
    @Query('rooms') rooms?: string,
    @Query('bedrooms') bedrooms?: string,
  ) {
    return this.propertiesService.findAll({
      lang,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      externalId,
      location,
      region: region as Region | undefined,
      propertyType,
      dealType,
      priceFrom: priceFrom ? parseInt(priceFrom, 10) : undefined,
      priceTo: priceTo ? parseInt(priceTo, 10) : undefined,
      areaFrom: areaFrom ? parseInt(areaFrom, 10) : undefined,
      areaTo: areaTo ? parseInt(areaTo, 10) : undefined,
      rooms: rooms ? parseInt(rooms, 10) : undefined,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
      includePrivate: false,
      onlyApproved: true,
    });
  }

  // ─── Authenticated User Endpoints ─────────────────────────────────────────

  @Get('my-properties')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current user's own properties" })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'User properties retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyProperties(
    @Req() req: any,
    @Query('lang') lang?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.id;
    if (!userId) throw new UnauthorizedException('User ID not found in token');

    return this.propertiesService.findUserProperties(userId, {
      lang,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single approved public property by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  @ApiResponse({ status: 200, description: 'Property retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findOne(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.propertiesService.findOne(id, lang, false, true);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new property' })
  @ApiBody({ type: CreatePropertyDto })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FilesInterceptor('images', 20, multerConfig('properties')))
  async createProperty(
    @Req() req: any,
    @Body() dto: CreatePropertyDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.propertiesService.createProperty(
      dto,
      images,
      req.user.id,
      req.user.role,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a property (owner or admin)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdatePropertyDto })
  @ApiResponse({ status: 200, description: 'Property updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – not the property owner',
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @UseInterceptors(FilesInterceptor('images', 20, multerConfig('properties')))
  async updateProperty(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.propertiesService.updateProperty(
      id,
      dto,
      images,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a property (owner or admin)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – not the property owner',
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async deleteProperty(@Req() req: any, @Param('id') id: string) {
    return this.propertiesService.deleteProperty(
      id,
      req.user.id,
      req.user.role,
    );
  }

  // ─── Translation Endpoints ────────────────────────────────────────────────

  @Get(':id/translations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all translations for a property (owner or admin)',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Translations retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async getTranslations(@Req() req: any, @Param('id') id: string) {
    return this.propertiesService.getTranslations(
      id,
      req.user.id,
      req.user.role,
    );
  }

  @Patch(':id/translations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add or update a translation (owner or admin)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpsertPropertyTranslationDto })
  @ApiResponse({
    status: 200,
    description: 'Translation upserted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async upsertTranslation(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpsertPropertyTranslationDto,
  ) {
    return this.propertiesService.upsertTranslation(
      id,
      dto.language,
      dto.title,
      dto.address,
      dto.description,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id/translations/:language')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a specific translation (owner or admin)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiParam({ name: 'language', example: 'ka' })
  @ApiResponse({ status: 200, description: 'Translation deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Translation not found' })
  async deleteTranslation(
    @Req() req: any,
    @Param('id') id: string,
    @Param('language') language: string,
  ) {
    return this.propertiesService.deleteTranslation(
      id,
      language,
      req.user.id,
      req.user.role,
    );
  }

  // ─── Gallery Endpoints ────────────────────────────────────────────────────

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a gallery image (owner or admin)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiParam({ name: 'imageId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async deleteGalleryImage(
    @Req() req: any,
    @Param('id') id: string,
    @Param('imageId') imageId: number,
  ) {
    return this.propertiesService.deleteGalleryImage(
      id,
      imageId,
      req.user.id,
      req.user.role,
    );
  }

  // ─── Admin Endpoints ──────────────────────────────────────────────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get ALL properties including private ones (admin only)',
  })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 })
  @ApiQuery({ name: 'externalId', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'region', required: false, enum: Region })
  @ApiQuery({
    name: 'propertyType',
    required: false,
    enum: ['APARTMENT', 'VILLA', 'COMMERCIAL', 'LAND', 'HOTEL'],
  })
  @ApiQuery({
    name: 'dealType',
    required: false,
    enum: ['RENT', 'SALE', 'DAILY_RENT'],
  })
  @ApiQuery({ name: 'priceFrom', required: false, type: 'number' })
  @ApiQuery({ name: 'priceTo', required: false, type: 'number' })
  @ApiQuery({ name: 'areaFrom', required: false, type: 'number' })
  @ApiQuery({ name: 'areaTo', required: false, type: 'number' })
  @ApiQuery({ name: 'rooms', required: false, type: 'number' })
  @ApiQuery({ name: 'bedrooms', required: false, type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'All properties retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllAdmin(
    @Query('lang') lang?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('externalId') externalId?: string,
    @Query('location') location?: string,
    @Query('region') region?: string,
    @Query('propertyType') propertyType?: string,
    @Query('dealType') dealType?: string,
    @Query('priceFrom') priceFrom?: string,
    @Query('priceTo') priceTo?: string,
    @Query('areaFrom') areaFrom?: string,
    @Query('areaTo') areaTo?: string,
    @Query('rooms') rooms?: string,
    @Query('bedrooms') bedrooms?: string,
  ) {
    return this.propertiesService.findAll({
      lang,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      externalId,
      location,
      region: region as Region | undefined,
      propertyType,
      dealType,
      priceFrom: priceFrom ? parseInt(priceFrom, 10) : undefined,
      priceTo: priceTo ? parseInt(priceTo, 10) : undefined,
      areaFrom: areaFrom ? parseInt(areaFrom, 10) : undefined,
      areaTo: areaTo ? parseInt(areaTo, 10) : undefined,
      rooms: rooms ? parseInt(rooms, 10) : undefined,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
      includePrivate: true,
      onlyApproved: false,
    });
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get any property by ID including private ones (admin only)',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  @ApiResponse({ status: 200, description: 'Property retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findOneAdmin(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.propertiesService.findOne(id, lang, true, false);
  }
}
