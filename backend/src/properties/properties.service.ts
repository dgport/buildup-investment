import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CreatePropertyDto } from './dto/CreateProperty.dto';
import { UpdatePropertyDto } from './dto/UpdateProperty.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { FileUtils } from '@/common/utils/file.utils';
import { TranslationSyncUtil } from '@/common/utils/translation-sync.util';
import { LANGUAGES } from '@/common/constants/language';
import { Region, UserRole, PropertyStatus } from '@prisma/client';

interface FindAllParams {
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
  includePrivate?: boolean;
  onlyApproved?: boolean;
  userId?: string;
}

@Injectable()
export class PropertiesService {
  constructor(private readonly prismaService: PrismaService) {}

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

  private async getDefaultContactPhone(): Promise<string> {
    const setting = await this.prismaService.siteSettings.findUnique({
      where: { key: 'default_contact_phone' },
    });
    return setting?.value ?? '+995 XXX XXX XXX';
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
   * Extracted to avoid duplicating ~50 field assignments in findAll and findOne.
   */
  private mapProperty(
    property: any,
    translation: any,
    regionName: string | null,
    defaultPhone: string,
    includeRejectionReason = false,
  ) {
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
      contactPhone: property.contactPhone ?? defaultPhone,
      userId: property.userId,
      user: property.user,
      ...(includeRejectionReason && {
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
      galleryImages: property.galleryImages,
    };
  }

  /** Pick the best available translation for a given language. */
  private selectTranslation(translations: any[], lang: string) {
    return (
      translations.find((t) => t.language === lang && t.title?.trim()) ??
      translations.find((t) => t.language === 'en' && t.title)
    );
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  async findAll(params: FindAllParams = {}) {
    const {
      lang = 'en',
      page = 1,
      limit = 10,
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
      includePrivate = false,
      onlyApproved = true,
      userId,
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (!includePrivate) where.public = true;
    if (onlyApproved) where.status = PropertyStatus.APPROVED;
    if (userId) where.userId = userId;
    if (externalId)
      where.externalId = { contains: externalId, mode: 'insensitive' };
    if (location) where.location = location;
    if (region) where.region = region;
    if (propertyType) where.propertyType = propertyType;
    if (dealType) where.dealType = dealType;

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

    if (rooms !== undefined) where.rooms = rooms;
    if (bedrooms !== undefined) where.bedrooms = bedrooms;

    const [total, properties] = await Promise.all([
      this.prismaService.property.count({ where }),
      this.prismaService.property.findMany({
        skip,
        take: limit,
        where,
        orderBy: [{ hotSale: 'desc' }, { createdAt: 'desc' }],
        include: {
          translations: true,
          galleryImages: { orderBy: { order: 'asc' } },
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true,
            },
          },
        },
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
    const regionTranslationMap = new Map<Region, any>();
    for (const rt of regionTranslations) {
      const existing = regionTranslationMap.get(rt.region);
      if (!existing || (existing.language !== lang && rt.language === lang)) {
        regionTranslationMap.set(rt.region, rt);
      }
    }

    const defaultPhone = await this.getDefaultContactPhone();

    const data = properties.map((property) => {
      const regionTranslation = property.region
        ? regionTranslationMap.get(property.region)
        : null;

      return this.mapProperty(
        property,
        this.selectTranslation(property.translations, lang),
        regionTranslation?.name ?? null,
        defaultPhone,
      );
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
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

  async findOne(
    id: string,
    lang = 'en',
    includePrivate = false,
    onlyApproved = true,
  ) {
    const where: any = { id };
    if (!includePrivate) where.public = true;
    if (onlyApproved) where.status = PropertyStatus.APPROVED;

    const property = await this.prismaService.property.findFirst({
      where,
      include: {
        translations: true,
        galleryImages: { orderBy: { order: 'asc' } },
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    const [regionTranslation, defaultPhone] = await Promise.all([
      this.getRegionTranslation(property.region, lang),
      this.getDefaultContactPhone(),
    ]);

    return this.mapProperty(
      property,
      this.selectTranslation(property.translations, lang),
      regionTranslation?.name ?? null,
      defaultPhone,
      true, // include rejectionReason on single-property view
    );
  }

  async createProperty(
    dto: CreatePropertyDto,
    images?: Express.Multer.File[],
    userId?: string,
    userRole?: UserRole,
  ) {
    const externalId = await this.generateUniqueExternalId();

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
        userId: userId ?? null,
        status: PropertyStatus.APPROVED,
        contactPhone: dto.contactPhone ?? null,
        price: dto.price != null ? parseInt(dto.price as any) : null,
        totalArea:
          dto.totalArea != null ? parseInt(dto.totalArea as any) : null,
        rooms: dto.rooms != null ? parseInt(dto.rooms as any) : null,
        bedrooms: dto.bedrooms != null ? parseInt(dto.bedrooms as any) : null,
        bathrooms:
          dto.bathrooms != null ? parseInt(dto.bathrooms as any) : null,
        floors: dto.floors != null ? parseInt(dto.floors as any) : null,
        floorsTotal:
          dto.floorsTotal != null ? parseInt(dto.floorsTotal as any) : null,
        ceilingHeight:
          dto.ceilingHeight != null
            ? parseFloat(dto.ceilingHeight as any)
            : null,
        isNonStandard: dto.isNonStandard ?? false,
        occupancy: dto.occupancy,
        heating: dto.heating,
        hotWater: dto.hotWater,
        parking: dto.parking,
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
        balconyArea:
          dto.balconyArea != null ? parseFloat(dto.balconyArea as any) : null,
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
      data: LANGUAGES.map((lang) => ({
        propertyId: property.id,
        language: lang,
        title: lang === 'en' && dto.title ? dto.title : '',
        address: lang === 'en' && dto.address ? dto.address : null,
        description: lang === 'en' && dto.description ? dto.description : null,
      })),
      skipDuplicates: true,
    });

    if (images?.length) {
      await this.saveGalleryImages(property.id, images, 0);
    }

    return this.findOne(property.id, 'en', true, false);
  }

  async updateProperty(
    id: string,
    dto: UpdatePropertyDto,
    images?: Express.Multer.File[],
    userId?: string,
    userRole?: UserRole,
  ) {
    if (userId && userRole) {
      await this.checkPropertyOwnership(id, userId, userRole);
    }

    const property = await this.prismaService.property.findUnique({
      where: { id },
    });
    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    // Build update payload from only the fields that were actually provided
    const updateData: any = {};

    const numberFields = [
      'price',
      'totalArea',
      'rooms',
      'bedrooms',
      'bathrooms',
      'floors',
      'floorsTotal',
    ] as const;
    const floatFields = ['ceilingHeight', 'balconyArea'] as const;
    const directFields = [
      'propertyType',
      'dealType',
      'location',
      'region',
      'address',
      'hotSale',
      'public',
      'contactPhone',
      'isNonStandard',
      'occupancy',
      'heating',
      'hotWater',
      'parking',
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

    for (const field of directFields) {
      if (dto[field] !== undefined) {
        updateData[field] = (dto[field] as any) || null;
      }
    }
    for (const field of numberFields) {
      if (dto[field] !== undefined) {
        updateData[field] =
          dto[field] != null ? parseInt(dto[field] as any) : null;
      }
    }
    for (const field of floatFields) {
      if (dto[field] !== undefined) {
        updateData[field] =
          dto[field] != null ? parseFloat(dto[field] as any) : null;
      }
    }

    const updatedProperty = await this.prismaService.property.update({
      where: { id },
      data: updateData,
    });

    if (images?.length) {
      const existingCount = await this.prismaService.propertyGalleryImage.count(
        {
          where: { propertyId: id },
        },
      );
      await this.saveGalleryImages(id, images, existingCount);
    }

    return this.findOne(updatedProperty.id, 'en', true, false);
  }

  async deleteProperty(id: string, userId?: string, userRole?: UserRole) {
    if (userId && userRole) {
      await this.checkPropertyOwnership(id, userId, userRole);
    }

    const property = await this.prismaService.property.findUnique({
      where: { id },
      include: { galleryImages: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    await Promise.all(
      property.galleryImages.map((image) =>
        FileUtils.deleteFile(image.imageUrl),
      ),
    );

    await this.prismaService.property.delete({ where: { id } });

    return { message: 'Property deleted successfully' };
  }

  async getTranslations(
    propertyId: string,
    userId?: string,
    userRole?: UserRole,
  ) {
    if (userId && userRole) {
      await this.checkPropertyOwnership(propertyId, userId, userRole);
    }

    const property = await this.prismaService.property.findUnique({
      where: { id: propertyId },
      include: { translations: { orderBy: { language: 'asc' } } },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${propertyId}" not found`);
    }

    await TranslationSyncUtil.syncMissingTranslations(this.prismaService, {
      entityId: propertyId as any,
      entityIdField: 'propertyId',
      translationModel: this.prismaService.propertyTranslations,
      existingTranslations: property.translations,
      defaultFields: { title: '', address: null, description: null },
    });

    const updated = await this.prismaService.property.findUnique({
      where: { id: propertyId },
      include: { translations: { orderBy: { language: 'asc' } } },
    });

    return updated!.translations;
  }

  async upsertTranslation(
    propertyId: string,
    language: string,
    title: string,
    address?: string,
    description?: string,
    userId?: string,
    userRole?: UserRole,
  ) {
    if (userId && userRole) {
      await this.checkPropertyOwnership(propertyId, userId, userRole);
    }

    const property = await this.prismaService.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      throw new NotFoundException(`Property with ID "${propertyId}" not found`);
    }

    return this.prismaService.propertyTranslations.upsert({
      where: { propertyId_language: { propertyId, language } },
      update: {
        title,
        address: address ?? null,
        description: description ?? null,
      },
      create: {
        propertyId,
        language,
        title,
        address: address ?? null,
        description: description ?? null,
      },
    });
  }

  async deleteTranslation(
    propertyId: string,
    language: string,
    userId?: string,
    userRole?: UserRole,
  ) {
    if (language === 'en') {
      throw new ConflictException('Cannot delete English translation');
    }

    if (userId && userRole) {
      await this.checkPropertyOwnership(propertyId, userId, userRole);
    }

    const translation =
      await this.prismaService.propertyTranslations.findUnique({
        where: { propertyId_language: { propertyId, language } },
      });

    if (!translation) {
      throw new NotFoundException(
        `Translation for language "${language}" not found`,
      );
    }

    await this.prismaService.propertyTranslations.delete({
      where: { propertyId_language: { propertyId, language } },
    });

    return { message: 'Translation deleted successfully' };
  }

  async deleteGalleryImage(
    propertyId: string,
    imageId: number,
    userId?: string,
    userRole?: UserRole,
  ) {
    if (userId && userRole) {
      await this.checkPropertyOwnership(propertyId, userId, userRole);
    }

    const image = await this.prismaService.propertyGalleryImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.propertyId !== propertyId) {
      throw new NotFoundException(`Image with ID "${imageId}" not found`);
    }

    await FileUtils.deleteFile(image.imageUrl);
    await this.prismaService.propertyGalleryImage.delete({
      where: { id: imageId },
    });

    return { message: 'Image deleted successfully' };
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
    const imageData = images
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
}
