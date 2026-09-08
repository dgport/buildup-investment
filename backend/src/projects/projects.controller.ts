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
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AdminGuard } from '@/auth/guards/admin.guard';
import {
  MAX_IMAGES_PER_REQUEST,
  multerConfig,
} from '@/common/config/multer.config';
import { ReorderImagesDto } from '@/properties/dto/ReorderImages.dto';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CreateUnitTypeDto, UpdateUnitTypeDto } from './dto/unit-type.dto';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';
import { PROJECT_AMENITIES } from '@/common/constants/project-amenities';

const toInt = (v?: string) => {
  if (v === undefined || v === '') return undefined;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? undefined : n;
};
const toBool = (v?: string) =>
  v === undefined || v === '' ? undefined : ['true', '1', 'yes'].includes(v.toLowerCase());

function parseListQuery(q: Record<string, string | undefined>) {
  return {
    lang: q.lang,
    page: toInt(q.page),
    limit: toInt(q.limit),
    search: q.search,
    region: q.region,
    developer: q.developer,
    status: q.status,
    rooms: toInt(q.rooms),
    pricePerSqmFrom: toInt(q.pricePerSqmFrom),
    pricePerSqmTo: toInt(q.pricePerSqmTo),
    priceFrom: toInt(q.priceFrom),
    priceTo: toInt(q.priceTo),
    deliveryYear: toInt(q.deliveryYear),
    hotSale: toBool(q.hotSale),
    sort: q.sort,
  };
}

const clientIp = (req: Request) =>
  (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
  req.ip;

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  // ─── Public ───────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Published development projects with filters' })
  @ApiQuery({ name: 'lang', required: false, example: 'ka' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'developer', required: false, description: 'id or slug' })
  @ApiQuery({ name: 'status', required: false, enum: ['PLANNED', 'UNDER_CONSTRUCTION', 'COMPLETED'] })
  @ApiQuery({ name: 'rooms', required: false, type: Number, description: '4 = 4+' })
  @ApiQuery({ name: 'pricePerSqmFrom', required: false, type: Number })
  @ApiQuery({ name: 'pricePerSqmTo', required: false, type: Number })
  @ApiQuery({ name: 'priceFrom', required: false, type: Number })
  @ApiQuery({ name: 'priceTo', required: false, type: Number })
  @ApiQuery({ name: 'deliveryYear', required: false, type: Number })
  @ApiQuery({ name: 'hotSale', required: false, type: Boolean })
  @ApiQuery({ name: 'sort', required: false, enum: ['featured', 'newest', 'price_asc', 'price_desc', 'delivery'] })
  findAll(@Query() query: Record<string, string | undefined>) {
    return this.projects.findAll(parseListQuery(query));
  }

  @Get('map')
  @ApiOperation({ summary: 'Published projects with coordinates (map view)' })
  @ApiQuery({ name: 'lang', required: false, example: 'ka' })
  findForMap(@Query('lang') lang?: string) {
    return this.projects.findForMap(lang);
  }

  @Get('amenities')
  @ApiOperation({ summary: 'Amenity keys a project can have' })
  amenities() {
    return PROJECT_AMENITIES;
  }

  // ─── Admin: leads (before :id routes) ─────────────────────────────────────

  @Get('leads')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultation requests (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['NEW', 'CONTACTED', 'CLOSED'] })
  @ApiQuery({ name: 'projectId', required: false })
  findLeads(@Query() q: Record<string, string | undefined>) {
    return this.projects.findLeads({
      page: toInt(q.page),
      limit: toInt(q.limit),
      status: q.status,
      projectId: q.projectId,
    });
  }

  @Patch('leads/:leadId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lead status / note (admin)' })
  updateLead(@Param('leadId') leadId: string, @Body() dto: UpdateLeadDto) {
    return this.projects.updateLead(leadId, dto);
  }

  @Delete('leads/:leadId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete lead (admin)' })
  deleteLead(@Param('leadId') leadId: string) {
    return this.projects.deleteLead(leadId);
  }

  // ─── Admin: projects ──────────────────────────────────────────────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'All projects incl. unpublished (admin)' })
  findAllAdmin(@Query() query: Record<string, string | undefined>) {
    return this.projects.findAll({ ...parseListQuery(query), includeUnpublished: true });
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'One project with every translation (admin)' })
  findOneAdmin(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.projects.findOne(id, lang, true);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create project (admin)' })
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update project (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete project and its files (admin)' })
  remove(@Param('id') id: string) {
    return this.projects.remove(id);
  }

  // ─── Admin: gallery ───────────────────────────────────────────────────────

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Add gallery photos (admin)' })
  @UseInterceptors(FilesInterceptor('images', MAX_IMAGES_PER_REQUEST, multerConfig('projects')))
  addImages(@Param('id') id: string, @UploadedFiles() images?: Express.Multer.File[]) {
    return this.projects.addImages(id, images, null);
  }

  @Patch(':id/images/order')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiBody({ type: ReorderImagesDto })
  @ApiOperation({ summary: 'Reorder gallery photos (admin)' })
  reorderImages(@Param('id') id: string, @Body() dto: ReorderImagesDto) {
    return this.projects.reorderImages(id, dto.imageIds, null);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a photo or floor plan (admin)' })
  deleteImage(@Param('id') id: string, @Param('imageId', ParseIntPipe) imageId: number) {
    return this.projects.deleteImage(id, imageId);
  }

  // ─── Admin: unit types ────────────────────────────────────────────────────

  @Post(':id/unit-types')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add an apartment type (admin)' })
  createUnitType(@Param('id') id: string, @Body() dto: CreateUnitTypeDto) {
    return this.projects.createUnitType(id, dto);
  }

  @Patch(':id/unit-types/:unitTypeId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an apartment type (admin)' })
  updateUnitType(
    @Param('id') id: string,
    @Param('unitTypeId') unitTypeId: string,
    @Body() dto: UpdateUnitTypeDto,
  ) {
    return this.projects.updateUnitType(id, unitTypeId, dto);
  }

  @Delete(':id/unit-types/:unitTypeId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an apartment type (admin)' })
  deleteUnitType(@Param('id') id: string, @Param('unitTypeId') unitTypeId: string) {
    return this.projects.deleteUnitType(id, unitTypeId);
  }

  @Post(':id/unit-types/:unitTypeId/images')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Add floor plans to an apartment type (admin)' })
  @UseInterceptors(FilesInterceptor('images', MAX_IMAGES_PER_REQUEST, multerConfig('projects')))
  addUnitTypeImages(
    @Param('id') id: string,
    @Param('unitTypeId') unitTypeId: string,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.projects.addImages(id, images, unitTypeId);
  }

  @Patch(':id/unit-types/:unitTypeId/images/order')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder floor plans (admin)' })
  reorderUnitTypeImages(
    @Param('id') id: string,
    @Param('unitTypeId') unitTypeId: string,
    @Body() dto: ReorderImagesDto,
  ) {
    return this.projects.reorderImages(id, dto.imageIds, unitTypeId);
  }

  // ─── Public: lead form ────────────────────────────────────────────────────

  @Post(':id/leads')
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request a consultation for a project' })
  createLead(@Param('id') id: string, @Body() dto: CreateLeadDto, @Req() req: Request) {
    return this.projects.createLead(id, dto, clientIp(req));
  }

  // ─── Public detail (last: "map", "leads", "admin" must match first) ──────

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Published project by id or slug' })
  @ApiQuery({ name: 'lang', required: false, example: 'ka' })
  findOne(@Param('idOrSlug') idOrSlug: string, @Query('lang') lang?: string) {
    return this.projects.findOne(idOrSlug, lang);
  }
}
