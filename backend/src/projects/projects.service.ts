import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeadStatus, Prisma, ProjectStatus, Region } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { FileUtils } from '@/common/utils/file.utils';
import { LANGUAGES, Language } from '@/common/constants/language';
import { uniqueSlug } from '@/common/utils/slug.util';
import { loadRegionNames } from '@/common/utils/region-names.util';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CreateUnitTypeDto, UpdateUnitTypeDto } from './dto/unit-type.dto';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';
import { DevelopersService, pickTranslation } from './developers.service';

export interface ProjectListParams {
  lang?: string;
  page?: number;
  limit?: number;
  search?: string;
  region?: string;
  developer?: string; // id or slug
  status?: string;
  rooms?: number;
  pricePerSqmFrom?: number;
  pricePerSqmTo?: number;
  priceFrom?: number;
  priceTo?: number;
  deliveryYear?: number;
  hotSale?: boolean;
  sort?: string; // "featured" | "newest" | "price_asc" | "price_desc" | "delivery"
  includeUnpublished?: boolean;
}

const MAX_PAGE_SIZE = 100;
const PROJECT_FOLDER = 'projects';

const UNIT_TYPE_INCLUDE = {
  translations: true,
  images: { orderBy: { order: 'asc' as const } },
} satisfies Prisma.ProjectUnitTypeInclude;

const PROJECT_INCLUDE = {
  translations: true,
  images: { where: { unitTypeId: null }, orderBy: { order: 'asc' as const } },
  developer: {
    include: {
      translations: true,
      _count: { select: { projects: { where: { published: true } } } },
    },
  },
  unitTypes: { include: UNIT_TYPE_INCLUDE, orderBy: [{ sortOrder: 'asc' as const }, { rooms: 'asc' as const }] },
  _count: { select: { leads: true } },
} satisfies Prisma.ProjectInclude;

type ProjectRow = Prisma.ProjectGetPayload<{ include: typeof PROJECT_INCLUDE }>;
type UnitTypeRow = Prisma.ProjectUnitTypeGetPayload<{
  include: typeof UNIT_TYPE_INCLUDE;
}>;

@Injectable()
export class ProjectsService {
  /** Very small in-memory rate limit for the public lead form. */
  private readonly leadHits = new Map<string, number[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly developers: DevelopersService,
  ) {}

  // ─── Mapping ──────────────────────────────────────────────────────────────

  private mapUnitType(unit: UnitTypeRow, lang: string, includeAll = false) {
    const translation = pickTranslation(
      unit.translations,
      lang,
      (t) => !!t.title?.trim() || !!t.description?.trim(),
    );
    return {
      id: unit.id,
      projectId: unit.projectId,
      rooms: unit.rooms,
      bedrooms: unit.bedrooms,
      areaFrom: unit.areaFrom,
      areaTo: unit.areaTo,
      pricePerSqm: unit.pricePerSqm,
      priceFrom: unit.priceFrom,
      floorsFrom: unit.floorsFrom,
      floorsTo: unit.floorsTo,
      availableCount: unit.availableCount,
      availability: unit.availability,
      sortOrder: unit.sortOrder,
      title: translation?.title ?? null,
      description: translation?.description ?? null,
      ...(includeAll && { translations: unit.translations }),
      images: unit.images,
    };
  }

  private mapProject(
    project: ProjectRow,
    lang: string,
    regionName: string | null,
    includeAll = false,
  ) {
    const translation = pickTranslation(
      project.translations,
      lang,
      (t) => !!t.title?.trim(),
    );
    const unitTypes = project.unitTypes.map((u) =>
      this.mapUnitType(u, lang, includeAll),
    );
    const roomOptions = [...new Set(unitTypes.map((u) => u.rooms))].sort(
      (a, b) => a - b,
    );
    const areas = unitTypes.map((u) => u.areaFrom).filter((a) => a > 0);
    const unitPricePerSqm = unitTypes
      .map((u) => u.pricePerSqm)
      .filter((p): p is number => typeof p === 'number' && p > 0);
    const unitPriceFrom = unitTypes
      .map((u) => u.priceFrom)
      .filter((p): p is number => typeof p === 'number' && p > 0);

    return {
      id: project.id,
      slug: project.slug,
      title: translation?.title ?? null,
      description: translation?.description ?? null,
      address: translation?.address ?? project.address,
      ...(includeAll && { translations: project.translations }),
      developer: this.developers.mapDeveloper(project.developer, lang),
      region: project.region,
      regionName,
      location: project.location,
      status: project.status,
      progress: project.progress,
      deliveryQuarter: project.deliveryQuarter,
      deliveryYear: project.deliveryYear,
      floors: project.floors,
      totalApartments: project.totalApartments,
      // Project-level numbers, falling back to the cheapest unit type
      pricePerSqmFrom:
        project.pricePerSqmFrom ??
        (unitPricePerSqm.length ? Math.min(...unitPricePerSqm) : null),
      priceFrom:
        project.priceFrom ??
        (unitPriceFrom.length ? Math.min(...unitPriceFrom) : null),
      hotSale: project.hotSale,
      published: project.published,
      videoUrl: project.videoUrl,
      tourUrl: project.tourUrl,
      installmentAvailable: project.installmentAvailable,
      downPaymentPercent: project.downPaymentPercent,
      installmentMonths: project.installmentMonths,
      amenities: project.amenities,
      sortOrder: project.sortOrder,
      coverImage: project.images[0]?.imageUrl ?? null,
      images: project.images,
      unitTypes,
      summary: {
        roomOptions,
        areaFrom: areas.length ? Math.min(...areas) : null,
        unitTypesCount: unitTypes.length,
      },
      ...(includeAll && { leadsCount: project._count.leads }),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  // ─── Public queries ───────────────────────────────────────────────────────

  async findAll(params: ProjectListParams = {}) {
    const lang = this.normalizeLang(params.lang);
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, params.limit ?? 12));
    const where: Prisma.ProjectWhereInput = {};

    if (!params.includeUnpublished) where.published = true;
    if (params.region && (Object.values(Region) as string[]).includes(params.region)) {
      where.region = params.region as Region;
    }
    if (
      params.status &&
      (Object.values(ProjectStatus) as string[]).includes(params.status)
    ) {
      where.status = params.status as ProjectStatus;
    }
    if (params.developer) {
      where.developer = {
        OR: [{ id: params.developer }, { slug: params.developer }],
      };
    }
    if (params.hotSale !== undefined) where.hotSale = params.hotSale;
    if (params.deliveryYear) where.deliveryYear = params.deliveryYear;
    if (params.rooms !== undefined) {
      where.unitTypes = {
        some: params.rooms >= 4 ? { rooms: { gte: 4 } } : { rooms: params.rooms },
      };
    }
    if (params.pricePerSqmFrom !== undefined || params.pricePerSqmTo !== undefined) {
      where.pricePerSqmFrom = {
        ...(params.pricePerSqmFrom !== undefined && { gte: params.pricePerSqmFrom }),
        ...(params.pricePerSqmTo !== undefined && { lte: params.pricePerSqmTo }),
      };
    }
    if (params.priceFrom !== undefined || params.priceTo !== undefined) {
      where.priceFrom = {
        ...(params.priceFrom !== undefined && { gte: params.priceFrom }),
        ...(params.priceTo !== undefined && { lte: params.priceTo }),
      };
    }
    if (params.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { translations: { some: { title: { contains: q, mode: 'insensitive' } } } },
        { developer: { name: { contains: q, mode: 'insensitive' } } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ProjectOrderByWithRelationInput[] = (() => {
      switch (params.sort) {
        case 'newest':
          return [{ createdAt: 'desc' }];
        case 'price_asc':
          return [{ pricePerSqmFrom: { sort: 'asc', nulls: 'last' } }];
        case 'price_desc':
          return [{ pricePerSqmFrom: { sort: 'desc', nulls: 'last' } }];
        case 'delivery':
          return [
            { deliveryYear: { sort: 'asc', nulls: 'last' } },
            { deliveryQuarter: { sort: 'asc', nulls: 'last' } },
          ];
        default:
          return [{ hotSale: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }];
      }
    })();

    const [total, rows] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: PROJECT_INCLUDE,
      }),
    ]);

    const regionNames = await loadRegionNames(
      this.prisma,
      rows.map((r) => r.region),
      lang,
    );

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      data: rows.map((row) =>
        this.mapProject(
          row,
          lang,
          row.region ? (regionNames.get(row.region) ?? null) : null,
          !!params.includeUnpublished,
        ),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /** Lightweight list for the map view (published projects with a pin). */
  async findForMap(lang?: string) {
    const normalized = this.normalizeLang(lang);
    const rows = await this.prisma.project.findMany({
      where: { published: true, location: { not: null } },
      include: PROJECT_INCLUDE,
      orderBy: [{ hotSale: 'desc' }, { sortOrder: 'asc' }],
      take: 300,
    });
    const regionNames = await loadRegionNames(
      this.prisma,
      rows.map((r) => r.region),
      normalized,
    );
    return rows.map((row) => {
      const full = this.mapProject(
        row,
        normalized,
        row.region ? (regionNames.get(row.region) ?? null) : null,
      );
      return {
        id: full.id,
        slug: full.slug,
        title: full.title,
        location: full.location,
        regionName: full.regionName,
        pricePerSqmFrom: full.pricePerSqmFrom,
        priceFrom: full.priceFrom,
        status: full.status,
        hotSale: full.hotSale,
        coverImage: full.coverImage,
        developer: { name: full.developer.name, slug: full.developer.slug },
      };
    });
  }

  async findOne(idOrSlug: string, lang?: string, includeUnpublished = false) {
    const normalized = this.normalizeLang(lang);
    const row = await this.prisma.project.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        ...(includeUnpublished ? {} : { published: true }),
      },
      include: PROJECT_INCLUDE,
    });
    if (!row) throw new NotFoundException('Project not found');

    const regionNames = await loadRegionNames(this.prisma, [row.region], normalized);
    const project = this.mapProject(
      row,
      normalized,
      row.region ? (regionNames.get(row.region) ?? null) : null,
      includeUnpublished,
    );

    // A few other published projects of the same developer
    const siblings = await this.prisma.project.findMany({
      where: { developerId: row.developerId, published: true, id: { not: row.id } },
      include: PROJECT_INCLUDE,
      orderBy: [{ hotSale: 'desc' }, { sortOrder: 'asc' }],
      take: 4,
    });
    const siblingRegions = await loadRegionNames(
      this.prisma,
      siblings.map((s) => s.region),
      normalized,
    );

    return {
      ...project,
      relatedProjects: siblings.map((s) =>
        this.mapProject(
          s,
          normalized,
          s.region ? (siblingRegions.get(s.region) ?? null) : null,
        ),
      ),
    };
  }

  // ─── Admin: projects ──────────────────────────────────────────────────────

  async create(dto: CreateProjectDto) {
    if (!this.hasAnyTitle(dto)) {
      throw new BadRequestException('A title is required in at least one language');
    }
    const developer = await this.prisma.developer.findUnique({
      where: { id: dto.developerId },
    });
    if (!developer) throw new BadRequestException('Developer not found');

    const slug = await this.resolveSlug(
      dto.slug ?? null,
      dto.titleEn ?? dto.titleKa ?? dto.titleRu ?? '',
    );

    const project = await this.prisma.project.create({
      data: {
        slug,
        developerId: dto.developerId,
        region: dto.region ?? null,
        address: dto.address ?? null,
        location: dto.location ?? null,
        status: dto.status ?? ProjectStatus.UNDER_CONSTRUCTION,
        progress: dto.progress ?? null,
        deliveryQuarter: dto.deliveryQuarter ?? null,
        deliveryYear: dto.deliveryYear ?? null,
        floors: dto.floors ?? null,
        totalApartments: dto.totalApartments ?? null,
        pricePerSqmFrom: dto.pricePerSqmFrom ?? null,
        priceFrom: dto.priceFrom ?? null,
        hotSale: dto.hotSale ?? false,
        published: dto.published ?? true,
        videoUrl: dto.videoUrl ?? null,
        tourUrl: dto.tourUrl ?? null,
        installmentAvailable: dto.installmentAvailable ?? false,
        downPaymentPercent: dto.downPaymentPercent ?? null,
        installmentMonths: dto.installmentMonths ?? null,
        amenities: dto.amenities ?? [],
        sortOrder: dto.sortOrder ?? 0,
        translations: {
          create: LANGUAGES.map((language) => ({
            language,
            title: this.textFor(dto, 'title', language) ?? '',
            description: this.textFor(dto, 'description', language) ?? null,
          })),
        },
      },
    });

    return this.findOne(project.id, 'en', true);
  }

  async update(id: string, dto: UpdateProjectDto) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');

    if (dto.developerId !== undefined) {
      const developer = await this.prisma.developer.findUnique({
        where: { id: dto.developerId },
      });
      if (!developer) throw new BadRequestException('Developer not found');
    }

    const data: Record<string, unknown> = {};
    const raw = dto as Record<string, unknown>;
    const scalarFields = [
      'developerId',
      'region',
      'address',
      'location',
      'status',
      'progress',
      'deliveryQuarter',
      'deliveryYear',
      'floors',
      'totalApartments',
      'pricePerSqmFrom',
      'priceFrom',
      'videoUrl',
      'tourUrl',
      'downPaymentPercent',
      'installmentMonths',
      'amenities',
      'sortOrder',
    ];
    for (const field of scalarFields) {
      if (raw[field] !== undefined) data[field] = raw[field];
    }
    for (const field of ['hotSale', 'published', 'installmentAvailable']) {
      if (typeof raw[field] === 'boolean') data[field] = raw[field];
    }
    if (dto.slug && dto.slug !== existing.slug) {
      data.slug = await this.resolveSlug(dto.slug, '', id);
    }

    await this.prisma.project.update({
      where: { id },
      data: data as Prisma.ProjectUncheckedUpdateInput,
    });

    for (const language of LANGUAGES) {
      const title = this.textFor(dto, 'title', language);
      const description = this.textFor(dto, 'description', language);
      if (title === undefined && description === undefined) continue;
      await this.prisma.projectTranslation.upsert({
        where: { projectId_language: { projectId: id, language } },
        create: {
          projectId: id,
          language,
          title: title ?? '',
          description: description ?? null,
        },
        update: {
          ...(title !== undefined && { title: title ?? '' }),
          ...(description !== undefined && { description }),
        },
      });
    }

    const titles = await this.prisma.projectTranslation.findMany({
      where: { projectId: id },
      select: { title: true },
    });
    if (!titles.some((t) => t.title.trim())) {
      throw new BadRequestException('A title is required in at least one language');
    }

    return this.findOne(id, 'en', true);
  }

  async remove(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    await this.prisma.project.delete({ where: { id } });
    await Promise.all(project.images.map((i) => FileUtils.deleteFile(i.imageUrl)));
    return { message: 'Project deleted' };
  }

  // ─── Admin: images (gallery + floor plans) ────────────────────────────────

  async addImages(
    projectId: string,
    files: Express.Multer.File[] | undefined,
    unitTypeId: string | null = null,
  ) {
    if (!files?.length) throw new BadRequestException('No images received');

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      await this.discardFiles(files);
      throw new NotFoundException('Project not found');
    }
    if (unitTypeId) {
      const unit = await this.prisma.projectUnitType.findFirst({
        where: { id: unitTypeId, projectId },
      });
      if (!unit) {
        await this.discardFiles(files);
        throw new NotFoundException('Unit type not found');
      }
    }

    const last = await this.prisma.projectImage.findFirst({
      where: { projectId, unitTypeId },
      orderBy: { order: 'desc' },
    });
    let order = (last?.order ?? -1) + 1;

    await this.prisma.projectImage.createMany({
      data: files
        .map((file) => FileUtils.generateImageUrl(file, PROJECT_FOLDER))
        .filter((url): url is string => !!url)
        .map((imageUrl) => ({ projectId, unitTypeId, imageUrl, order: order++ })),
    });

    return this.prisma.projectImage.findMany({
      where: { projectId, unitTypeId },
      orderBy: { order: 'asc' },
    });
  }

  async reorderImages(projectId: string, imageIds: number[], unitTypeId: string | null = null) {
    const existing = await this.prisma.projectImage.findMany({
      where: { projectId, unitTypeId },
      orderBy: { order: 'asc' },
      select: { id: true },
    });
    const known = new Set(existing.map((i) => i.id));
    const unknown = imageIds.filter((id) => !known.has(id));
    if (unknown.length) {
      throw new BadRequestException(`Unknown image ids: ${unknown.join(', ')}`);
    }
    const rest = existing.map((i) => i.id).filter((id) => !imageIds.includes(id));
    const finalOrder = [...imageIds, ...rest];
    await this.prisma.$transaction(
      finalOrder.map((id, order) =>
        this.prisma.projectImage.update({ where: { id }, data: { order } }),
      ),
    );
    return this.prisma.projectImage.findMany({
      where: { projectId, unitTypeId },
      orderBy: { order: 'asc' },
    });
  }

  async deleteImage(projectId: string, imageId: number) {
    const image = await this.prisma.projectImage.findFirst({
      where: { id: imageId, projectId },
    });
    if (!image) throw new NotFoundException('Image not found');
    await this.prisma.projectImage.delete({ where: { id: imageId } });
    await FileUtils.deleteFile(image.imageUrl);

    // keep order contiguous inside the same group
    const rest = await this.prisma.projectImage.findMany({
      where: { projectId, unitTypeId: image.unitTypeId },
      orderBy: { order: 'asc' },
      select: { id: true },
    });
    await this.prisma.$transaction(
      rest.map((img, order) =>
        this.prisma.projectImage.update({ where: { id: img.id }, data: { order } }),
      ),
    );
    return { message: 'Image deleted' };
  }

  // ─── Admin: unit types ────────────────────────────────────────────────────

  async createUnitType(projectId: string, dto: CreateUnitTypeDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    this.validateUnitRanges(dto);

    const unit = await this.prisma.projectUnitType.create({
      data: {
        projectId,
        rooms: dto.rooms,
        bedrooms: dto.bedrooms ?? null,
        areaFrom: dto.areaFrom,
        areaTo: dto.areaTo ?? null,
        pricePerSqm: dto.pricePerSqm ?? null,
        priceFrom: dto.priceFrom ?? null,
        floorsFrom: dto.floorsFrom ?? null,
        floorsTo: dto.floorsTo ?? null,
        availableCount: dto.availableCount ?? null,
        availability: dto.availability ?? 'AVAILABLE',
        sortOrder: dto.sortOrder ?? 0,
        translations: {
          create: LANGUAGES.map((language) => ({
            language,
            title: this.textFor(dto, 'title', language) ?? null,
            description: this.textFor(dto, 'description', language) ?? null,
          })),
        },
      },
      include: UNIT_TYPE_INCLUDE,
    });
    return this.mapUnitType(unit, 'en', true);
  }

  async updateUnitType(projectId: string, unitTypeId: string, dto: UpdateUnitTypeDto) {
    const unit = await this.prisma.projectUnitType.findFirst({
      where: { id: unitTypeId, projectId },
    });
    if (!unit) throw new NotFoundException('Unit type not found');
    this.validateUnitRanges({ ...unit, ...dto } as CreateUnitTypeDto);

    const data: Record<string, unknown> = {};
    const raw = dto as Record<string, unknown>;
    for (const field of [
      'rooms',
      'bedrooms',
      'areaFrom',
      'areaTo',
      'pricePerSqm',
      'priceFrom',
      'floorsFrom',
      'floorsTo',
      'availableCount',
      'availability',
      'sortOrder',
    ]) {
      if (raw[field] !== undefined) data[field] = raw[field];
    }
    await this.prisma.projectUnitType.update({
      where: { id: unitTypeId },
      data: data as Prisma.ProjectUnitTypeUncheckedUpdateInput,
    });

    for (const language of LANGUAGES) {
      const title = this.textFor(dto, 'title', language);
      const description = this.textFor(dto, 'description', language);
      if (title === undefined && description === undefined) continue;
      await this.prisma.projectUnitTypeTranslation.upsert({
        where: { unitTypeId_language: { unitTypeId, language } },
        create: { unitTypeId, language, title: title ?? null, description: description ?? null },
        update: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
        },
      });
    }

    const updated = await this.prisma.projectUnitType.findUniqueOrThrow({
      where: { id: unitTypeId },
      include: UNIT_TYPE_INCLUDE,
    });
    return this.mapUnitType(updated, 'en', true);
  }

  async deleteUnitType(projectId: string, unitTypeId: string) {
    const unit = await this.prisma.projectUnitType.findFirst({
      where: { id: unitTypeId, projectId },
      include: { images: true },
    });
    if (!unit) throw new NotFoundException('Unit type not found');
    await this.prisma.projectUnitType.delete({ where: { id: unitTypeId } });
    await Promise.all(unit.images.map((i) => FileUtils.deleteFile(i.imageUrl)));
    return { message: 'Unit type deleted' };
  }

  // ─── Leads ────────────────────────────────────────────────────────────────

  async createLead(projectId: string, dto: CreateLeadDto, ip: string | undefined) {
    if (dto.website) {
      // Honeypot filled → pretend success, store nothing
      return { message: 'ok' };
    }
    this.checkLeadRateLimit(ip ?? 'unknown');

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, published: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    if (dto.unitTypeId) {
      const unit = await this.prisma.projectUnitType.findFirst({
        where: { id: dto.unitTypeId, projectId },
      });
      if (!unit) throw new BadRequestException('Unit type not found');
    }

    const lead = await this.prisma.projectLead.create({
      data: {
        projectId,
        unitTypeId: dto.unitTypeId ?? null,
        name: dto.name,
        phone: dto.phone,
        email: dto.email ?? null,
        message: dto.message ?? null,
        locale: dto.locale ?? 'ka',
        ipAddress: ip ?? null,
      },
    });
    return { id: lead.id, message: 'ok' };
  }

  async findLeads(params: { page?: number; limit?: number; status?: string; projectId?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, params.limit ?? 20));
    const where: Prisma.ProjectLeadWhereInput = {};
    if (params.status && (Object.values(LeadStatus) as string[]).includes(params.status)) {
      where.status = params.status as LeadStatus;
    }
    if (params.projectId) where.projectId = params.projectId;

    const [total, rows, counts] = await Promise.all([
      this.prisma.projectLead.count({ where }),
      this.prisma.projectLead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          project: { select: { id: true, slug: true, translations: true } },
        },
      }),
      this.prisma.projectLead.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    const unitTypeIds = rows.map((r) => r.unitTypeId).filter((v): v is string => !!v);
    const units = unitTypeIds.length
      ? await this.prisma.projectUnitType.findMany({
          where: { id: { in: unitTypeIds } },
          include: { translations: true },
        })
      : [];
    const unitMap = new Map(units.map((u) => [u.id, u]));

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      data: rows.map((lead) => {
        const unit = lead.unitTypeId ? unitMap.get(lead.unitTypeId) : undefined;
        return {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          message: lead.message,
          locale: lead.locale,
          status: lead.status,
          note: lead.note,
          createdAt: lead.createdAt,
          project: {
            id: lead.project.id,
            slug: lead.project.slug,
            title: pickTranslation(lead.project.translations, lead.locale, (t) => !!t.title)?.title ?? lead.project.slug,
          },
          unitType: unit
            ? {
                id: unit.id,
                rooms: unit.rooms,
                areaFrom: unit.areaFrom,
                title: pickTranslation(unit.translations, lead.locale, (t) => !!t.title)?.title ?? null,
              }
            : null,
        };
      }),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])),
      },
    };
  }

  async updateLead(id: string, dto: UpdateLeadDto) {
    const lead = await this.prisma.projectLead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    return this.prisma.projectLead.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.note !== undefined && { note: dto.note }),
      },
    });
  }

  async deleteLead(id: string) {
    const lead = await this.prisma.projectLead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    await this.prisma.projectLead.delete({ where: { id } });
    return { message: 'Lead deleted' };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private normalizeLang(lang?: string): Language {
    const value = (lang ?? 'en').toLowerCase().slice(0, 2);
    return (LANGUAGES as readonly string[]).includes(value) ? (value as Language) : 'en';
  }

  /** Reads e.g. dto.titleKa / dto.descriptionEn; undefined = not provided. */
  private textFor(
    dto: object,
    field: 'title' | 'description',
    language: Language,
  ): string | null | undefined {
    const key = `${field}${language[0].toUpperCase()}${language.slice(1)}`;
    return (dto as Record<string, unknown>)[key] as string | null | undefined;
  }

  private hasAnyTitle(dto: CreateProjectDto | UpdateProjectDto) {
    return [dto.titleKa, dto.titleEn, dto.titleRu].some(
      (t) => typeof t === 'string' && t.trim().length > 0,
    );
  }

  private validateUnitRanges(dto: Partial<CreateUnitTypeDto>) {
    if (dto.areaTo != null && dto.areaFrom != null && dto.areaTo < dto.areaFrom) {
      throw new BadRequestException('areaTo must be ≥ areaFrom');
    }
    if (dto.floorsTo != null && dto.floorsFrom != null && dto.floorsTo < dto.floorsFrom) {
      throw new BadRequestException('floorsTo must be ≥ floorsFrom');
    }
  }

  private async resolveSlug(requested: string | null, base: string, excludeId?: string) {
    const exists = async (slug: string) =>
      !!(await this.prisma.project.findFirst({
        where: { slug, ...(excludeId && { id: { not: excludeId } }) },
        select: { id: true },
      }));

    if (requested) {
      if (await exists(requested)) {
        throw new ConflictException(`Slug "${requested}" is already used`);
      }
      return requested;
    }
    return uniqueSlug(base, exists);
  }

  private async discardFiles(files?: Express.Multer.File[]) {
    if (!files?.length) return;
    await Promise.all(
      files.map((f) => FileUtils.deleteFile(FileUtils.generateImageUrl(f, PROJECT_FOLDER) ?? '')),
    );
  }

  private checkLeadRateLimit(ip: string) {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;
    const hits = (this.leadHits.get(ip) ?? []).filter((t) => now - t < windowMs);
    if (hits.length >= 5) {
      throw new HttpException(
        'Too many requests, please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    hits.push(now);
    this.leadHits.set(ip, hits);
    if (this.leadHits.size > 5000) this.leadHits.clear();
  }
}
