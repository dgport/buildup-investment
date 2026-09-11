import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePropertyDto } from './dto/CreateProperty.dto';
import { UpdatePropertyStatusDto } from './dto/UpdatePropertyStatus.dto';
import { EmailService } from '@/auth/services/email.service';
import { ConfigService } from '@nestjs/config';
import { UpdatePropertyDto } from './dto/UpdateProperty.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { FileUtils } from '@/common/utils/file.utils';
import { TranslationSyncUtil } from '@/common/utils/translation-sync.util';
import { LANGUAGES, Language } from '@/common/constants/language';
import {
  Region,
  UserRole,
  PropertyStatus,
  PropertyType,
  DealType,
  Prisma,
} from '@prisma/client';

export interface FindAllParams {
  lang?: string;
  page?: number;
  limit?: number;
  externalId?: string;
  location?: string;
  region?: Region;
  propertyType?: string;
  dealType?: string;
  priceFrom?: number;
  priceTo?: number;
  areaFrom?: number;
  areaTo?: number;
  rooms?: number;
  bedrooms?: number;
  hotSale?: boolean;
  /** Exclude one listing (used for "similar listings") */
  excludeId?: string;
  /** featured (default) | newest | price_asc | price_desc | area_desc */
  sort?: string;
  includePrivate?: boolean;
  onlyApproved?: boolean;
  userId?: string;
  /** Admin only: filter by moderation status (ignored when onlyApproved). */
  status?: PropertyStatus;
  /** Admin only: matches the external ID or any title. */
  search?: string;
}

const MAX_PAGE_SIZE = 100;

/** Fields that can be cleared with an empty value (nullable in the schema). */
const NULLABLE_TEXT_FIELDS = ['location', 'address', 'contactPhone'] as const;
const NULLABLE_ENUM_FIELDS = [
  'region',
  'occupancy',
  'heating',
  'hotWater',
  'parking',
] as const;
const INT_FIELDS = [
  'price',
  'totalArea',
  'rooms',
  'bedrooms',
  'bathrooms',
  'floors',
  'floorsTotal',
] as const;
const FLOAT_FIELDS = ['ceilingHeight', 'balconyArea'] as const;
const BOOLEAN_FIELDS = [
  'hotSale',
  'public',
  'isNonStandard',
  'hasConditioner',
  'hasFurniture',
  'hasBed',
  'hasSofa',
  'hasTable',
  'hasChairs',
  'hasStove',
  'hasRefrigerator',
  'hasOven',
  'hasWashingMachine',
  'hasKitchenAppliances',
  'hasBalcony',
  'hasNaturalGas',
  'hasInternet',
  'hasTV',
  'hasSewerage',
  'isFenced',
  'hasYardLighting',
  'hasGrill',
  'hasAlarm',
  'hasVentilation',
  'hasWater',
  'hasElectricity',
  'hasGate',
] as const;

const PROPERTY_INCLUDE = {
  translations: true,
  galleryImages: { orderBy: { order: 'asc' as const } },
  user: {
    select: {
      id: true,
      firstname: true,
      lastname: true,
      phone: true,
      email: true,
    },
  },
} satisfies Prisma.PropertyInclude;

type PropertyWithRelations = Prisma.PropertyGetPayload<{
  include: typeof PROPERTY_INCLUDE;
}>;

@Injectable()
export class PropertiesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private async generateUniqueExternalId(): Promise<string> {
    while (true) {
      const externalId = String(Math.floor(100000 + Math.random() * 900000));
      const existing = await this.prismaService.property.findUnique({
        where: { externalId },
      });
      if (!existing) return externalId;
    }
  }

  private normalizeLang(lang?: string): Language {
    const value = (lang ?? 'en').toLowerCase().slice(0, 2);
    return (LANGUAGES as readonly string[]).includes(value)
      ? (value as Language)
      : 'en';
  }

  private async getRegionTranslation(region: Region | null, lang: string) {
    if (!region) return null;

    const translation = await this.prismaService.regionTranslations.findFirst({
      where: { region, language: lang },
    });

    // Fall back to English if the requested language is not found
    if (!translation && lang !== 'en') {
      return this.prismaService.regionTranslations.findFirst({
        where: { region, language: 'en' },
      });
    }

    return translation;
  }

  /** Site setting `listing_moderation` = "on" sends new listings to review. */
  private async isModerationOn(): Promise<boolean> {
    const setting = await this.prismaService.siteSettings.findUnique({
      where: { key: 'listing_moderation' },
    });
    return setting?.value === 'on';
  }

  private async getDefaultContactPhone(): Promise<string | null> {
    const setting = await this.prismaService.siteSettings.findUnique({
      where: { key: 'default_contact_phone' },
    });
    return setting?.value ?? process.env.DEFAULT_CONTACT_PHONE ?? null;
  }

  private async checkPropertyOwnership(
    propertyId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    if (userRole === UserRole.ADMIN) return;

    const property = await this.prismaService.property.findUnique({
      where: { id: propertyId },
      select: { userId: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${propertyId}" not found`);
    }

    if (property.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this property',
      );
    }
  }

  /**
   * Map a raw Prisma property record to the standard API response shape.
   * `includePrivateDetails` adds owner-only data (rejection reason, owner
   * e-mail). Public responses never expose the owner's e-mail address.
   */
  private mapProperty(
    property: PropertyWithRelations,
    translation: PropertyWithRelations['translations'][number] | undefined,
    regionName: string | null,
    defaultPhone: string | null,
    includePrivateDetails = false,
  ) {
    const owner = property.user
      ? {
          id: property.user.id,
          firstname: property.user.firstname,
          lastname: property.user.lastname,
          phone: property.user.phone,
          ...(includePrivateDetails && { email: property.user.email }),
        }
      : null;

    return {
      id: property.id,
      externalId: property.externalId,
      propertyType: property.propertyType,
      dealType: property.dealType,
      location: property.location,
      region: property.region,
      regionName,
      address: property.address,
      price: property.price,
      hotSale: property.hotSale,
      public: property.public,
      status: property.status,
      // Listing phone → owner's profile phone → site-wide default
      contactPhone:
        property.contactPhone ?? property.user?.phone ?? defaultPhone,
      userId: property.userId,
      user: owner,
      ...(includePrivateDetails && {
        rejectionReason: property.rejectionReason,
      }),
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      totalArea: property.totalArea,
      rooms: property.rooms,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      floors: property.floors,
      floorsTotal: property.floorsTotal,
      ceilingHeight: property.ceilingHeight,
      isNonStandard: property.isNonStandard,
      occupancy: property.occupancy,
      heating: property.heating,
      hotWater: property.hotWater,
      parking: property.parking,
      hasConditioner: property.hasConditioner,
      hasFurniture: property.hasFurniture,
      hasBed: property.hasBed,
      hasSofa: property.hasSofa,
      hasTable: property.hasTable,
      hasChairs: property.hasChairs,
      hasStove: property.hasStove,
      hasRefrigerator: property.hasRefrigerator,
      hasOven: property.hasOven,
      hasWashingMachine: property.hasWashingMachine,
      hasKitchenAppliances: property.hasKitchenAppliances,
      hasBalcony: property.hasBalcony,
      balconyArea: property.balconyArea,
      hasNaturalGas: property.hasNaturalGas,
      hasInternet: property.hasInternet,
      hasTV: property.hasTV,
      hasSewerage: property.hasSewerage,
      isFenced: property.isFenced,
      hasYardLighting: property.hasYardLighting,
      hasGrill: property.hasGrill,
      hasAlarm: property.hasAlarm,
      hasVentilation: property.hasVentilation,
      hasWater: property.hasWater,
      hasElectricity: property.hasElectricity,
      hasGate: property.hasGate,
      translation: translation ?? null,
      // All languages, so owners can see what is still missing
      ...(includePrivateDetails && { translations: property.translations }),
      galleryImages: property.galleryImages,
    };
  }

  /**
   * Pick the best available translation: requested language → English →
   * any language that has a title. A translation row with an empty title is
   * treated as missing.
   */
  private selectTranslation(
    translations: PropertyWithRelations['translations'],
    lang: string,
  ) {
    const hasTitle = (t: { title: string }) => t.title?.trim().length > 0;
    return (
      translations.find((t) => t.language === lang && hasTitle(t)) ??
      translations.find((t) => t.language === 'en' && hasTitle(t)) ??
      translations.find(hasTitle)
    );
  }

  private buildTranslationRows(
    propertyId: string,
    dto: CreatePropertyDto,
  ): {
    propertyId: string;
    language: Language;
    title: string;
    description: string | null;
  }[] {
    const titles: Record<Language, string | null | undefined> = {
      en: dto.titleEn ?? dto.title,
      ka: dto.titleKa,
      ru: dto.titleRu,
    };
    const descriptions: Record<Language, string | null | undefined> = {
      en: dto.descriptionEn ?? dto.description,
      ka: dto.descriptionKa,
      ru: dto.descriptionRu,
    };

    return LANGUAGES.map((language) => ({
      propertyId,
      language,
      title: titles[language]?.trim() ?? '',
      description: descriptions[language]?.trim() || null,
    }));
  }

  private hasAnyTitle(dto: CreatePropertyDto | UpdatePropertyDto): boolean {
    return [dto.title, dto.titleEn, dto.titleKa, dto.titleRu].some(
      (t) => typeof t === 'string' && t.trim().length > 0,
    );
  }

  private hasTranslationInput(dto: UpdatePropertyDto): boolean {
    return [
      dto.title,
      dto.titleEn,
      dto.titleKa,
      dto.titleRu,
      dto.description,
      dto.descriptionEn,
      dto.descriptionKa,
      dto.descriptionRu,
    ].some((v) => v !== undefined);
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  async findAll(params: FindAllParams = {}) {
    const {
      page: rawPage = 1,
      limit: rawLimit = 10,
      externalId,
      location,
      region,
      propertyType,
      dealType,
      priceFrom,
      priceTo,
      areaFrom,
      areaTo,
      rooms,
      bedrooms,
      hotSale,
      includePrivate = false,
      onlyApproved = true,
      userId,
    } = params;

    const lang = this.normalizeLang(params.lang);
    const page = Math.max(1, Number.isFinite(rawPage) ? rawPage : 1);
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 10),
    );
    const skip = (page - 1) * limit;
    const where: Prisma.PropertyWhereInput = {};

    if (!includePrivate) where.public = true;
    if (onlyApproved) where.status = PropertyStatus.APPROVED;
    if (userId) where.userId = userId;
    if (externalId)
      where.externalId = { contains: externalId, mode: 'insensitive' };
    if (location) where.location = location;
    if (region && Object.values(Region).includes(region)) where.region = region;
    if (
      propertyType &&
      Object.values(PropertyType).includes(propertyType as PropertyType)
    ) {
      where.propertyType = propertyType as PropertyType;
    }
    if (dealType && Object.values(DealType).includes(dealType as DealType)) {
      where.dealType = dealType as DealType;
    }
    if (hotSale !== undefined) where.hotSale = hotSale;
    if (params.excludeId) where.id = { not: params.excludeId };
    if (!onlyApproved && params.status) where.status = params.status;
    if (params.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { externalId: { contains: q, mode: 'insensitive' } },
        {
          translations: {
            some: { title: { contains: q, mode: 'insensitive' } },
          },
        },
        { user: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (priceFrom !== undefined || priceTo !== undefined) {
      where.price = {};
      if (priceFrom !== undefined) where.price.gte = priceFrom;
      if (priceTo !== undefined) where.price.lte = priceTo;
    }

    if (areaFrom !== undefined || areaTo !== undefined) {
      where.totalArea = {};
      if (areaFrom !== undefined) where.totalArea.gte = areaFrom;
      if (areaTo !== undefined) where.totalArea.lte = areaTo;
    }

    // "5" in the filter UI means "5 or more"
    if (rooms !== undefined) where.rooms = rooms >= 5 ? { gte: 5 } : rooms;
    if (bedrooms !== undefined)
      where.bedrooms = bedrooms >= 4 ? { gte: 4 } : bedrooms;

    const orderBy: Prisma.PropertyOrderByWithRelationInput[] = (() => {
      switch (params.sort) {
        case 'newest':
          return [{ createdAt: 'desc' }];
        case 'price_asc':
          return [
            { price: { sort: 'asc', nulls: 'last' } },
            { createdAt: 'desc' },
          ];
        case 'price_desc':
          return [
            { price: { sort: 'desc', nulls: 'last' } },
            { createdAt: 'desc' },
          ];
        case 'area_desc':
          return [
            { totalArea: { sort: 'desc', nulls: 'last' } },
            { createdAt: 'desc' },
          ];
        default:
          return [{ hotSale: 'desc' }, { createdAt: 'desc' }];
      }
    })();

    const [total, properties] = await Promise.all([
      this.prismaService.property.count({ where }),
      this.prismaService.property.findMany({
        skip,
        take: limit,
        where,
        orderBy,
        include: PROPERTY_INCLUDE,
      }),
    ]);

    // Batch-load region translations for all unique regions in one query
    const uniqueRegions = [
      ...new Set(properties.map((p) => p.region).filter(Boolean)),
    ] as Region[];

    const regionTranslations =
      uniqueRegions.length > 0
        ? await this.prismaService.regionTranslations.findMany({
            where: {
              region: { in: uniqueRegions },
              language: { in: lang !== 'en' ? [lang, 'en'] : ['en'] },
            },
          })
        : [];

    // Build a map: region → best translation (prefer requested lang, fall back to 'en')
    const regionTranslationMap = new Map<
      Region,
      (typeof regionTranslations)[number]
    >();
    for (const rt of regionTranslations) {
      const existing = regionTranslationMap.get(rt.region);
      if (!existing || (existing.language !== lang && rt.language === lang)) {
        regionTranslationMap.set(rt.region, rt);
      }
    }

    const defaultPhone = await this.getDefaultContactPhone();
    const includePrivateDetails = Boolean(userId) || includePrivate;

    const data = properties.map((property) => {
      const regionTranslation = property.region
        ? regionTranslationMap.get(property.region)
        : null;

      return this.mapProperty(
        property,
        this.selectTranslation(property.translations, lang),
        regionTranslation?.name ?? null,
        defaultPhone,
        includePrivateDetails,
      );
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data,
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

  /** Get all properties belonging to a specific user (bypasses public/status filters). */
  async findUserProperties(
    userId: string,
    params: Partial<FindAllParams> = {},
  ) {
    return this.findAll({
      ...params,
      userId,
      includePrivate: true,
      onlyApproved: false,
    });
  }

  /** Per-status counts for the dashboard header. */
  async getUserStats(userId: string) {
    const grouped = await this.prismaService.property.groupBy({
      by: ['status'],
      where: { userId },
      _count: { _all: true },
    });

    const byStatus = Object.fromEntries(
      grouped.map((g) => [g.status, g._count._all]),
    ) as Partial<Record<PropertyStatus, number>>;

    const total = grouped.reduce((sum, g) => sum + g._count._all, 0);

    return {
      total,
      approved: byStatus.APPROVED ?? 0,
      pending: byStatus.PENDING ?? 0,
      rejected: byStatus.REJECTED ?? 0,
      draft: byStatus.DRAFT ?? 0,
    };
  }

  async findOne(
    id: string,
    lang = 'en',
    includePrivate = false,
    onlyApproved = true,
  ) {
    const normalizedLang = this.normalizeLang(lang);
    const where: Prisma.PropertyWhereInput = { id };
    if (!includePrivate) where.public = true;
    if (onlyApproved) where.status = PropertyStatus.APPROVED;

    const property = await this.prismaService.property.findFirst({
      where,
      include: PROPERTY_INCLUDE,
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    const [regionTranslation, defaultPhone] = await Promise.all([
      this.getRegionTranslation(property.region, normalizedLang),
      this.getDefaultContactPhone(),
    ]);

    return this.mapProperty(
      property,
      this.selectTranslation(property.translations, normalizedLang),
      regionTranslation?.name ?? null,
      defaultPhone,
      includePrivate,
    );
  }

  /**
   * Admin moderation: approve / reject / send back to review. Notifies the
   * owner by e-mail (best effort — a mail failure never fails the request).
   */
  async setStatus(id: string, dto: UpdatePropertyStatusDto) {
    const property = await this.prismaService.property.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, firstname: true } },
        translations: { select: { language: true, title: true } },
      },
    });
    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    const rejectionReason =
      dto.status === PropertyStatus.REJECTED
        ? (dto.rejectionReason ?? null)
        : null;

    await this.prismaService.property.update({
      where: { id },
      data: { status: dto.status, rejectionReason },
    });

    if (
      property.status !== dto.status &&
      property.user?.email &&
      (dto.status === PropertyStatus.APPROVED ||
        dto.status === PropertyStatus.REJECTED)
    ) {
      const rows = property.translations;
      const title =
        (
          rows.find((t) => t.language === 'ka') ??
          rows.find((t) => t.language === 'en') ??
          rows[0]
        )?.title ?? `#${property.externalId}`;
      const frontend = this.config.get<string>('FRONTEND_URL') ?? '';
      const url =
        dto.status === PropertyStatus.APPROVED
          ? `${frontend}/properties/${property.id}`
          : `${frontend}/dashboard`;
      void this.emailService
        .sendListingStatusEmail(
          property.user.email,
          property.user.firstname,
          title,
          dto.status,
          rejectionReason,
          url,
        )
        .catch(() => undefined);
    }

    return this.findOne(id, 'en', true, false);
  }

  /** Owner (or admin) view of a property regardless of visibility/status. */
  async findOneForOwner(
    id: string,
    userId: string,
    userRole: UserRole,
    lang = 'en',
  ) {
    await this.checkPropertyOwnership(id, userId, userRole);
    return this.findOne(id, lang, true, false);
  }

  async createProperty(
    dto: CreatePropertyDto,
    images: Express.Multer.File[] | undefined,
    userId: string,
  ) {
    if (!this.hasAnyTitle(dto)) {
      await this.discardUploadedFiles(images);
      throw new BadRequestException(
        'A title is required in at least one language',
      );
    }

    const [externalId, moderation] = await Promise.all([
      this.generateUniqueExternalId(),
      this.isModerationOn(),
    ]);

    const property = await this.prismaService.property.create({
      data: {
        externalId,
        propertyType: dto.propertyType,
        dealType: dto.dealType,
        location: dto.location ?? null,
        region: dto.region ?? null,
        address: dto.address ?? null,
        hotSale: dto.hotSale ?? false,
        public: dto.public ?? true,
        userId,
        status: moderation ? PropertyStatus.PENDING : PropertyStatus.APPROVED,
        contactPhone: dto.contactPhone ?? null,
        price: dto.price ?? null,
        totalArea: dto.totalArea ?? null,
        rooms: dto.rooms ?? null,
        bedrooms: dto.bedrooms ?? null,
        bathrooms: dto.bathrooms ?? null,
        floors: dto.floors ?? null,
        floorsTotal: dto.floorsTotal ?? null,
        ceilingHeight: dto.ceilingHeight ?? null,
        balconyArea: dto.balconyArea ?? null,
        isNonStandard: dto.isNonStandard ?? false,
        occupancy: dto.occupancy ?? null,
        heating: dto.heating ?? null,
        hotWater: dto.hotWater ?? null,
        parking: dto.parking ?? null,
        hasConditioner: dto.hasConditioner ?? false,
        hasFurniture: dto.hasFurniture ?? false,
        hasBed: dto.hasBed ?? false,
        hasSofa: dto.hasSofa ?? false,
        hasTable: dto.hasTable ?? false,
        hasChairs: dto.hasChairs ?? false,
        hasStove: dto.hasStove ?? false,
        hasRefrigerator: dto.hasRefrigerator ?? false,
        hasOven: dto.hasOven ?? false,
        hasWashingMachine: dto.hasWashingMachine ?? false,
        hasKitchenAppliances: dto.hasKitchenAppliances ?? false,
        hasBalcony: dto.hasBalcony ?? false,
        hasNaturalGas: dto.hasNaturalGas ?? false,
        hasInternet: dto.hasInternet ?? false,
        hasTV: dto.hasTV ?? false,
        hasSewerage: dto.hasSewerage ?? false,
        isFenced: dto.isFenced ?? false,
        hasYardLighting: dto.hasYardLighting ?? false,
        hasGrill: dto.hasGrill ?? false,
        hasAlarm: dto.hasAlarm ?? false,
        hasVentilation: dto.hasVentilation ?? false,
        hasWater: dto.hasWater ?? false,
        hasElectricity: dto.hasElectricity ?? false,
        hasGate: dto.hasGate ?? false,
      },
    });

    await this.prismaService.propertyTranslations.createMany({
      data: this.buildTranslationRows(property.id, dto).map((row) => ({
        ...row,
        address: dto.address ?? null,
      })),
      skipDuplicates: true,
    });

    if (images?.length) {
      await this.saveGalleryImages(property.id, images, 0);
    }

    if (moderation) {
      const title =
        dto.titleKa || dto.titleEn || dto.titleRu || `#${externalId}`;
      void this.emailService
        .sendAdminAlert(
          `🕒 განცხადება ელოდება შემოწმებას — ${title}`,
          [
            { label: 'განცხადება', value: `${title} (#${externalId})` },
            { label: 'ტიპი', value: `${dto.propertyType} · ${dto.dealType}` },
            ...(dto.price ? [{ label: 'ფასი', value: `$${dto.price}` }] : []),
          ],
          'შემოწმება',
          `${this.config.get<string>('FRONTEND_URL') ?? ''}/admin/listings?status=PENDING`,
        )
        .catch(() => undefined);
    }

    return this.findOne(property.id, 'en', true, false);
  }

  async updateProperty(
    id: string,
    dto: UpdatePropertyDto,
    images: Express.Multer.File[] | undefined,
    userId: string,
    userRole: UserRole,
  ) {
    try {
      await this.checkPropertyOwnership(id, userId, userRole);
    } catch (error) {
      await this.discardUploadedFiles(images);
      throw error;
    }

    const property = await this.prismaService.property.findUnique({
      where: { id },
    });
    if (!property) {
      await this.discardUploadedFiles(images);
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    // Build the update payload from only the fields that were actually sent.
    // The DTO transforms turn "" into `null`, which clears a nullable field;
    // `undefined` means "leave untouched".
    const updateData: Record<string, unknown> = {};
    const raw = dto as Record<string, unknown>;

    if (dto.propertyType !== undefined)
      updateData.propertyType = dto.propertyType;
    if (dto.dealType !== undefined) updateData.dealType = dto.dealType;

    for (const field of [
      ...NULLABLE_TEXT_FIELDS,
      ...NULLABLE_ENUM_FIELDS,
      ...INT_FIELDS,
      ...FLOAT_FIELDS,
    ]) {
      if (raw[field] !== undefined) updateData[field] = raw[field];
    }
    for (const field of BOOLEAN_FIELDS) {
      if (typeof raw[field] === 'boolean') updateData[field] = raw[field];
    }

    // An owner who fixes a rejected listing sends it back into review
    // (or straight to approved when moderation is off).
    if (
      userRole !== UserRole.ADMIN &&
      property.status === PropertyStatus.REJECTED
    ) {
      updateData.status = (await this.isModerationOn())
        ? PropertyStatus.PENDING
        : PropertyStatus.APPROVED;
      updateData.rejectionReason = null;
    }

    await this.prismaService.property.update({
      where: { id },
      data: updateData as Prisma.PropertyUncheckedUpdateInput,
    });

    // Optional inline translation update (title*/description* fields)
    if (this.hasTranslationInput(dto)) {
      await this.applyTranslationFields(id, dto);
    }

    if (images?.length) {
      const last = await this.prismaService.propertyGalleryImage.findFirst({
        where: { propertyId: id },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      await this.saveGalleryImages(id, images, (last?.order ?? -1) + 1);
    }

    return this.findOne(id, 'en', true, false);
  }

  /**
   * Inline titleXx / descriptionXx fields on update. `undefined` = untouched,
   * `null` (sent as "") = cleared.
   */
  private async applyTranslationFields(
    propertyId: string,
    dto: UpdatePropertyDto,
  ) {
    const pick = <T>(specific: T | undefined, alias: T | undefined) =>
      specific !== undefined ? specific : alias;

    const titles: Record<Language, string | null | undefined> = {
      en: pick(dto.titleEn, dto.title),
      ka: dto.titleKa,
      ru: dto.titleRu,
    };
    const descriptions: Record<Language, string | null | undefined> = {
      en: pick(dto.descriptionEn, dto.description),
      ka: dto.descriptionKa,
      ru: dto.descriptionRu,
    };

    for (const lang of LANGUAGES) {
      const title = titles[lang];
      const description = descriptions[lang];
      if (title === undefined && description === undefined) continue;

      await this.prismaService.propertyTranslations.upsert({
        where: { propertyId_language: { propertyId, language: lang } },
        create: {
          propertyId,
          language: lang,
          title: title ?? '',
          description: description ?? null,
        },
        update: {
          ...(title !== undefined && { title: title ?? '' }),
          ...(description !== undefined && { description }),
        },
      });
    }

    // Never leave a property without any title
    const remaining = await this.prismaService.propertyTranslations.findMany({
      where: { propertyId },
      select: { title: true },
    });
    if (!remaining.some((t) => t.title.trim().length > 0)) {
      throw new BadRequestException(
        'A title is required in at least one language',
      );
    }
  }

  async deleteProperty(id: string, userId: string, userRole: UserRole) {
    await this.checkPropertyOwnership(id, userId, userRole);

    const property = await this.prismaService.property.findUnique({
      where: { id },
      include: { galleryImages: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    await this.prismaService.property.delete({ where: { id } });

    await Promise.all(
      property.galleryImages.map((image) =>
        FileUtils.deleteFile(image.imageUrl),
      ),
    );

    return { message: 'Property deleted successfully' };
  }

  async getTranslations(
    propertyId: string,
    userId: string,
    userRole: UserRole,
  ) {
    await this.checkPropertyOwnership(propertyId, userId, userRole);

    const property = await this.prismaService.property.findUnique({
      where: { id: propertyId },
      include: { translations: { orderBy: { language: 'asc' } } },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${propertyId}" not found`);
    }

    await TranslationSyncUtil.syncMissingTranslations(this.prismaService, {
      entityId: propertyId,
      entityIdField: 'propertyId',
      translationModel: this.prismaService.propertyTranslations,
      existingTranslations: property.translations,
      defaultFields: { title: '', address: null, description: null },
    });

    const updated = await this.prismaService.propertyTranslations.findMany({
      where: { propertyId },
    });

    // Stable, meaningful order: ka, en, ru
    const order = new Map(LANGUAGES.map((l, i) => [l, i]));
    return updated.sort(
      (a, b) =>
        (order.get(a.language as Language) ?? 99) -
        (order.get(b.language as Language) ?? 99),
    );
  }

  async upsertTranslation(
    propertyId: string,
    language: string,
    title: string,
    address: string | undefined,
    description: string | undefined,
    userId: string,
    userRole: UserRole,
  ) {
    await this.checkPropertyOwnership(propertyId, userId, userRole);

    const property = await this.prismaService.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      throw new NotFoundException(`Property with ID "${propertyId}" not found`);
    }

    return this.prismaService.propertyTranslations.upsert({
      where: { propertyId_language: { propertyId, language } },
      update: {
        title: title.trim(),
        address: address ?? null,
        description: description ?? null,
      },
      create: {
        propertyId,
        language,
        title: title.trim(),
        address: address ?? null,
        description: description ?? null,
      },
    });
  }

  async deleteTranslation(
    propertyId: string,
    language: string,
    userId: string,
    userRole: UserRole,
  ) {
    await this.checkPropertyOwnership(propertyId, userId, userRole);

    const translation =
      await this.prismaService.propertyTranslations.findUnique({
        where: { propertyId_language: { propertyId, language } },
      });

    if (!translation) {
      throw new NotFoundException(
        `Translation for language "${language}" not found`,
      );
    }

    const others = await this.prismaService.propertyTranslations.findMany({
      where: { propertyId, language: { not: language } },
      select: { title: true },
    });
    if (!others.some((t) => t.title.trim().length > 0)) {
      throw new ConflictException(
        'Cannot delete the only translation that has a title',
      );
    }

    // Keep the row (every language always exists) but clear its content
    await this.prismaService.propertyTranslations.update({
      where: { propertyId_language: { propertyId, language } },
      data: { title: '', address: null, description: null },
    });

    return { message: 'Translation cleared successfully' };
  }

  async deleteGalleryImage(
    propertyId: string,
    imageId: number,
    userId: string,
    userRole: UserRole,
  ) {
    await this.checkPropertyOwnership(propertyId, userId, userRole);

    const image = await this.prismaService.propertyGalleryImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.propertyId !== propertyId) {
      throw new NotFoundException(`Image with ID "${imageId}" not found`);
    }

    await this.prismaService.propertyGalleryImage.delete({
      where: { id: imageId },
    });
    await FileUtils.deleteFile(image.imageUrl);
    await this.compactImageOrder(propertyId);

    return { message: 'Image deleted successfully' };
  }

  /** Re-order gallery images; the first ID becomes the cover photo. */
  async reorderGalleryImages(
    propertyId: string,
    imageIds: number[],
    userId: string,
    userRole: UserRole,
  ) {
    await this.checkPropertyOwnership(propertyId, userId, userRole);

    const existing = await this.prismaService.propertyGalleryImage.findMany({
      where: { propertyId },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((i) => i.id));

    const unknown = imageIds.filter((id) => !existingIds.has(id));
    if (unknown.length) {
      throw new BadRequestException(
        `Images do not belong to this property: ${unknown.join(', ')}`,
      );
    }

    // Images not mentioned keep their relative order after the listed ones
    const rest = existing
      .map((i) => i.id)
      .filter((id) => !imageIds.includes(id));
    const finalOrder = [...imageIds, ...rest];

    await this.prismaService.$transaction(
      finalOrder.map((id, order) =>
        this.prismaService.propertyGalleryImage.update({
          where: { id },
          data: { order },
        }),
      ),
    );

    return this.prismaService.propertyGalleryImage.findMany({
      where: { propertyId },
      orderBy: { order: 'asc' },
    });
  }

  async syncAllTranslations() {
    return TranslationSyncUtil.syncAllEntities(
      this.prismaService,
      this.prismaService.property,
      'propertyId',
      this.prismaService.propertyTranslations,
      () => ({ title: '', address: null, description: null }),
    );
  }

  // ─── Private Utilities ────────────────────────────────────────────────────

  private async saveGalleryImages(
    propertyId: string,
    images: Express.Multer.File[],
    startOrder: number,
  ): Promise<void> {
    const realImages = await FileUtils.keepOnlyRealImages(images);
    const imageData = realImages
      .map((image, index) => ({
        url: FileUtils.generateImageUrl(image, 'properties'),
        order: startOrder + index,
      }))
      .filter(
        (item): item is { url: string; order: number } => item.url !== null,
      );

    if (imageData.length > 0) {
      await this.prismaService.propertyGalleryImage.createMany({
        data: imageData.map((item) => ({
          propertyId,
          imageUrl: item.url,
          order: item.order,
        })),
      });
    }
  }

  /** Keep `order` contiguous (0..n-1) after deletions. */
  private async compactImageOrder(propertyId: string): Promise<void> {
    const images = await this.prismaService.propertyGalleryImage.findMany({
      where: { propertyId },
      orderBy: { order: 'asc' },
      select: { id: true, order: true },
    });

    const updates = images
      .map((img, index) => ({ id: img.id, order: index, current: img.order }))
      .filter((img) => img.current !== img.order);

    if (updates.length) {
      await this.prismaService.$transaction(
        updates.map((u) =>
          this.prismaService.propertyGalleryImage.update({
            where: { id: u.id },
            data: { order: u.order },
          }),
        ),
      );
    }
  }

  /** Multer has already written the files; remove them when the request fails. */
  private async discardUploadedFiles(images?: Express.Multer.File[]) {
    if (!images?.length) return;
    await Promise.all(
      images.map((image) =>
        FileUtils.deleteFile(
          FileUtils.generateImageUrl(image, 'properties') ?? '',
        ),
      ),
    );
  }
}
