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
import {
  MAX_IMAGES_PER_REQUEST,
  multerConfig,
} from '../common/config/multer.config';
import { UpsertPropertyTranslationDto } from './dto/UpsertPropertyTranslation.dto';
import { CreatePropertyDto } from './dto/CreateProperty.dto';
import { UpdatePropertyDto } from './dto/UpdateProperty.dto';
import { ReorderImagesDto } from './dto/ReorderImages.dto';
import { UpdatePropertyStatusDto } from './dto/UpdatePropertyStatus.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AdminGuard } from '@/auth/guards/admin.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/auth/types/user.type';
import { DealType, PropertyStatus, PropertyType, Region } from '@prisma/client';

const toInt = (value?: string): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const toBool = (value?: string): boolean | undefined => {
  if (value === undefined || value === '') return undefined;
  return ['true', '1', 'yes'].includes(value.toLowerCase());
};

/** Shared query-string filters for listing endpoints. */
function parseListQuery(q: Record<string, string | undefined>) {
  return {
    lang: q.lang,
    page: toInt(q.page),
    limit: toInt(q.limit),
    externalId: q.externalId,
    location: q.location,
    region: q.region as Region | undefined,
    propertyType: q.propertyType,
    dealType: q.dealType,
    priceFrom: toInt(q.priceFrom),
    priceTo: toInt(q.priceTo),
    areaFrom: toInt(q.areaFrom),
    areaTo: toInt(q.areaTo),
    rooms: toInt(q.rooms),
    bedrooms: toInt(q.bedrooms),
    hotSale: toBool(q.hotSale),
    sort: q.sort,
    excludeId: q.excludeId,
  };
}

const LIST_QUERY_DOCS = [
  { name: 'lang', required: false, example: 'ka' },
  { name: 'page', required: false, type: Number, example: 1 },
  { name: 'limit', required: false, type: Number, example: 12 },
  { name: 'externalId', required: false, example: '591595' },
  { name: 'location', required: false, example: '41.64,41.61' },
  { name: 'region', required: false, enum: Region },
  { name: 'propertyType', required: false, enum: PropertyType },
  { name: 'dealType', required: false, enum: DealType },
  { name: 'priceFrom', required: false, type: Number },
  { name: 'priceTo', required: false, type: Number },
  { name: 'areaFrom', required: false, type: Number },
  { name: 'areaTo', required: false, type: Number },
  { name: 'rooms', required: false, type: Number },
  { name: 'bedrooms', required: false, type: Number },
  { name: 'hotSale', required: false, type: Boolean },
  {
    name: 'sort',
    required: false,
    enum: ['featured', 'newest', 'price_asc', 'price_desc', 'area_desc'],
  },
  { name: 'excludeId', required: false },
] as const;

function ListQueryDocs(): MethodDecorator {
  return (target, key, descriptor) => {
    for (const doc of LIST_QUERY_DOCS) {
      ApiQuery(doc as any)(target, key, descriptor);
    }
    return descriptor;
  };
}

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // ─── Public Endpoints ─────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get all approved public properties with filters' })
  @ListQueryDocs()
  @ApiResponse({
    status: 200,
    description: 'Properties retrieved successfully',
  })
  async findAll(@Query() query: Record<string, string | undefined>) {
    return this.propertiesService.findAll({
      ...parseListQuery(query),
      includePrivate: false,
      onlyApproved: true,
    });
  }

  // ─── Authenticated User Endpoints ─────────────────────────────────────────

  @Get('my-properties')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current user's own properties" })
  @ListQueryDocs()
  @ApiResponse({ status: 200, description: 'User properties retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyProperties(
    @CurrentUser() user: User,
    @Query() query: Record<string, string | undefined>,
  ) {
    return this.propertiesService.findUserProperties(
      user.id,
      parseListQuery(query),
    );
  }

  @Get('my-properties/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Per-status counts of the current user's properties",
  })
  @ApiResponse({ status: 200, description: 'Stats retrieved' })
  async getMyStats(@CurrentUser() user: User) {
    return this.propertiesService.getUserStats(user.id);
  }

  @Get(':id/manage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get a property for editing, regardless of visibility (owner or admin)',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiQuery({ name: 'lang', required: false, example: 'ka' })
  @ApiResponse({ status: 200, description: 'Property retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – not the owner' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findOneForOwner(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Query('lang') lang?: string,
  ) {
    return this.propertiesService.findOneForOwner(id, user.id, user.role, lang);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single approved public property by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiQuery({ name: 'lang', required: false, example: 'ka' })
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
  @ApiOperation({ summary: 'Create a new property (assigned to the caller)' })
  @ApiBody({ type: CreatePropertyDto })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(
    FilesInterceptor(
      'images',
      MAX_IMAGES_PER_REQUEST,
      multerConfig('properties'),
    ),
  )
  async createProperty(
    @CurrentUser() user: User,
    @Body() dto: CreatePropertyDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.propertiesService.createProperty(dto, images, user.id);
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
  @ApiResponse({ status: 403, description: 'Forbidden – not the owner' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @UseInterceptors(
    FilesInterceptor(
      'images',
      MAX_IMAGES_PER_REQUEST,
      multerConfig('properties'),
    ),
  )
  async updateProperty(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.propertiesService.updateProperty(
      id,
      dto,
      images,
      user.id,
      user.role,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a property (owner or admin)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – not the owner' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async deleteProperty(@CurrentUser() user: User, @Param('id') id: string) {
    return this.propertiesService.deleteProperty(id, user.id, user.role);
  }

  // ─── Translation Endpoints ────────────────────────────────────────────────

  @Get(':id/translations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all translations for a property (owner or admin)',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Translations retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async getTranslations(@CurrentUser() user: User, @Param('id') id: string) {
    return this.propertiesService.getTranslations(id, user.id, user.role);
  }

  @Patch(':id/translations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add or update a translation (owner or admin)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpsertPropertyTranslationDto })
  @ApiResponse({ status: 200, description: 'Translation upserted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async upsertTranslation(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpsertPropertyTranslationDto,
  ) {
    return this.propertiesService.upsertTranslation(
      id,
      dto.language,
      dto.title,
      dto.address ?? undefined,
      dto.description ?? undefined,
      user.id,
      user.role,
    );
  }

  @Delete(':id/translations/:language')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear a specific translation (owner or admin)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiParam({ name: 'language', example: 'ru' })
  @ApiResponse({ status: 200, description: 'Translation cleared' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Translation not found' })
  @ApiResponse({ status: 409, description: 'Last remaining title' })
  async deleteTranslation(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('language') language: string,
  ) {
    return this.propertiesService.deleteTranslation(
      id,
      language,
      user.id,
      user.role,
    );
  }

  // ─── Gallery Endpoints ────────────────────────────────────────────────────

  @Patch(':id/images/order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder gallery images (owner or admin)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: ReorderImagesDto })
  @ApiResponse({ status: 200, description: 'New gallery order' })
  @ApiResponse({ status: 400, description: 'Unknown image IDs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async reorderImages(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: ReorderImagesDto,
  ) {
    return this.propertiesService.reorderGalleryImages(
      id,
      dto.imageIds,
      user.id,
      user.role,
    );
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a gallery image (owner or admin)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiParam({ name: 'imageId', type: 'number' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async deleteGalleryImage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.propertiesService.deleteGalleryImage(
      id,
      imageId,
      user.id,
      user.role,
    );
  }

  // ─── Admin Endpoints ──────────────────────────────────────────────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get ALL properties including private ones (admin only)',
  })
  @ListQueryDocs()
  @ApiResponse({ status: 200, description: 'All properties retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async findAllAdmin(@Query() query: Record<string, string | undefined>) {
    const status = Object.values(PropertyStatus).includes(
      query.status as PropertyStatus,
    )
      ? (query.status as PropertyStatus)
      : undefined;
    return this.propertiesService.findAll({
      ...parseListQuery(query),
      status,
      search: query.search,
      includePrivate: true,
      onlyApproved: false,
    });
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Approve / reject / re-queue a listing (admin only)',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async setStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyStatusDto,
  ) {
    return this.propertiesService.setStatus(id, dto);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get any property by ID including private ones (admin only)',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiQuery({ name: 'lang', required: false, example: 'ka' })
  @ApiResponse({ status: 200, description: 'Property retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findOneAdmin(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.propertiesService.findOne(id, lang, true, false);
  }
}
