import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
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
import { Region } from '@prisma/client';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get('seo-preview/:id')
  @ApiOperation({
    summary: 'Internal: Get HTML with meta tags for social media bots',
  })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @Header('Content-Type', 'text/html; charset=utf-8')
  async getSeoPreview(@Param('id') id: string, @Res() res: Response) {
    console.log('🤖 SEO Preview requested for:', id);

    try {
      const property = await this.propertiesService.findOne(id, 'en', false);

      if (!property) {
        console.log('❌ Property not found');
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
              <title>Property Not Found</title>
            </head>
            <body>
              <h1>Property Not Found</h1>
            </body>
          </html>
        `);
      }

      console.log('✅ Property found:', property.id);

      const title =
        property.translation?.title || 'Apartment for sale in Batumi';
      const description = (
        property.translation?.description ||
        'Premium real estate investment in Georgia'
      ).substring(0, 160);

      // FIXED: Handle image URL correctly to avoid duplicate /uploads
      let imageUrl = 'https://buildup.ge/Logo.png';

      if (property.galleryImages && property.galleryImages.length > 0) {
        const imgPath = property.galleryImages[0].imageUrl;
        console.log('🖼️ Raw image path from DB:', imgPath);

        if (imgPath) {
          // If it's already a full URL
          if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
            imageUrl = imgPath;
          }
          // If path already contains 'uploads/' anywhere
          else if (imgPath.includes('uploads/')) {
            imageUrl = `https://buildup.ge/${imgPath.replace(/^\/+/, '')}`; // Remove leading slashes
          }
          // If path starts with /uploads/
          else if (imgPath.startsWith('/uploads/')) {
            imageUrl = `https://buildup.ge${imgPath}`;
          }
          // If path starts with /
          else if (imgPath.startsWith('/')) {
            imageUrl = `https://buildup.ge${imgPath}`;
          }
          // Plain filename without path
          else {
            imageUrl = `https://buildup.ge/uploads/${imgPath}`;
          }
        }
      }

      console.log('🔗 Final image URL:', imageUrl);

      const canonicalUrl = `https://buildup.ge/properties/${id}`;

      // Escape HTML special characters
      const escapeHtml = (text: string): string => {
        const map: { [key: string]: string } = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
      };

      const safeTitle = escapeHtml(title);
      const safeDescription = escapeHtml(description);

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:type" content="image/avif" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Buildup Investment" />
  <meta property="og:locale" content="en_US" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta name="twitter:site" content="@buildup" />

  <!-- Redirect non-bots to React app -->
  <script>
    if (!/bot|crawler|spider|crawling|facebookexternalhit|whatsapp|twitter|telegram|linkedin|discord|slack/i.test(navigator.userAgent)) {
      window.location.href = "${canonicalUrl}";
    }
  </script>
</head>
<body>
  <h1>${safeTitle}</h1>
  <img src="${imageUrl}" alt="${safeTitle}" style="max-width:100%; height:auto;" />
  <p>${safeDescription}</p>
  <p>If you're not redirected, <a href="${canonicalUrl}">click here</a>.</p>
</body>
</html>`;

      console.log('✅ Sending HTML response');
      return res.send(html);
    } catch (error) {
      console.error('❌ Error in getSeoPreview:', error);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>Error</title>
          </head>
          <body>
            <h1>Internal Server Error</h1>
            <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
          </body>
        </html>
      `);
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all PUBLIC properties with pagination and filters',
  })
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
    name: 'externalId',
    required: false,
    description: 'Filter by property external ID',
    example: '591595',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location (city name)',
    example: 'Batumi',
  })
  @ApiQuery({
    name: 'region',
    required: false,
    description: 'Filter by region',
    enum: ['BATUMI', 'KOBULETI', 'CHAKVI', 'MAKHINJAURI', 'GONIO', 'UREKI'],
  })
  @ApiQuery({
    name: 'propertyType',
    required: false,
    description: 'Filter by property type',
    enum: ['APARTMENT', 'VILLA', 'COMMERCIAL', 'LAND', 'HOTEL'],
  })
  @ApiQuery({
    name: 'dealType',
    required: false,
    description: 'Filter by deal type',
    enum: ['RENT', 'SALE', 'DAILY_RENT'],
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
    description: 'Number of rooms',
    type: 'number',
  })
  @ApiQuery({
    name: 'bedrooms',
    required: false,
    description: 'Number of bedrooms',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Public properties retrieved successfully',
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
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get PUBLIC property by ID' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'string' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code',
    example: 'en',
  })
  @ApiResponse({
    status: 200,
    description: 'Public property retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findOne(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.propertiesService.findOne(id, lang, false);
  }

  @Get('admin/all')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get ALL properties including private ones (Admin only)',
  })
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
    name: 'externalId',
    required: false,
    description: 'Filter by property external ID',
    example: '591595',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location (city name)',
    example: 'Batumi',
  })
  @ApiQuery({
    name: 'region',
    required: false,
    description: 'Filter by region',
    enum: ['BATUMI', 'KOBULETI', 'CHAKVI', 'MAKHINJAURI', 'GONIO', 'UREKI'],
  })
  @ApiQuery({
    name: 'propertyType',
    required: false,
    description: 'Filter by property type',
    enum: ['APARTMENT', 'VILLA', 'COMMERCIAL', 'LAND', 'HOTEL'],
  })
  @ApiQuery({
    name: 'dealType',
    required: false,
    description: 'Filter by deal type',
    enum: ['RENT', 'SALE', 'DAILY_RENT'],
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
    description: 'Number of rooms',
    type: 'number',
  })
  @ApiQuery({
    name: 'bedrooms',
    required: false,
    description: 'Number of bedrooms',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'All properties (public + private) retrieved successfully',
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
    });
  }

  @Get('admin/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get property by ID including private ones (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'string' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code',
    example: 'en',
  })
  @ApiResponse({
    status: 200,
    description: 'Property retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findOneAdmin(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.propertiesService.findOne(id, lang, true);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new property (Admin only)' })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Update a property (Admin only)' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Property updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Delete a property (Admin only)' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async deleteProperty(@Param('id') id: string) {
    return this.propertiesService.deleteProperty(id);
  }

  @Get(':id/translations')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all translations for a property (Admin only)' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Translations retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async getTranslations(@Param('id') id: string) {
    return this.propertiesService.getTranslations(id);
  }

  @Patch(':id/translations')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add or update a translation (Admin only)' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Translation added/updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Delete a specific translation (Admin only)' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'string' })
  @ApiParam({
    name: 'language',
    description: 'Language code (e.g., ka, ru)',
    example: 'ka',
  })
  @ApiResponse({ status: 200, description: 'Translation deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Delete a gallery image (Admin only)' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'string' })
  @ApiParam({ name: 'imageId', description: 'Image ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async deleteGalleryImage(
    @Param('id') id: string,
    @Param('imageId') imageId: number,
  ) {
    return this.propertiesService.deleteGalleryImage(id, imageId);
  }
}
