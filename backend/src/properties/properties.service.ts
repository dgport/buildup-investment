import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreatePropertyDto } from './dto/CreateProperty.dto';
import { UpdatePropertyDto } from './dto/UpdateProperty.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { FileUtils } from '@/common/utils/file.utils';
import { TranslationSyncUtil } from '@/common/utils/translation-sync.util';
import { LANGUAGES } from '@/common/constants/language';
import { Region } from '@prisma/client';

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
}

@Injectable()
export class PropertiesService {
  constructor(private readonly prismaService: PrismaService) {}

  private async generateUniqueExternalId(): Promise<string> {
    let externalId = '';
    let isUnique = false;

    while (!isUnique) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      externalId = randomNum.toString();

      const existing = await this.prismaService.property.findUnique({
        where: { externalId },
      });

      if (!existing) {
        isUnique = true;
      }
    }

    return externalId;
  }

  private async getRegionTranslation(region: Region | null, lang: string) {
    if (!region) return null;

    const translation = await this.prismaService.regionTranslations.findFirst({
      where: {
        region: region,
        language: lang,
      },
    });

    if (!translation && lang !== 'en') {
      return await this.prismaService.regionTranslations.findFirst({
        where: {
          region: region,
          language: 'en',
        },
      });
    }

    return translation;
  }

  async findAll(params: FindAllParams = {}) {
    const {
      lang = 'en',
      externalId,
      page = 1,
      limit = 10,
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
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (!includePrivate) {
      where.public = true;
    }

    if (externalId) {
      where.externalId = { contains: externalId, mode: 'insensitive' };
    }
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

    if (rooms !== undefined) {
      where.rooms = rooms;
    }

    if (bedrooms !== undefined) {
      where.bedrooms = bedrooms;
    }

    const total = await this.prismaService.property.count({ where });

    const properties = await this.prismaService.property.findMany({
      skip,
      take: limit,
      where,
      orderBy: [{ hotSale: 'desc' }, { createdAt: 'desc' }],
      include: {
        translations: true,
        galleryImages: {
          orderBy: { order: 'asc' },
        },
      },
    });

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

    const regionTranslationMap = new Map<Region, any>();
    regionTranslations.forEach((rt) => {
      const existing = regionTranslationMap.get(rt.region);
      if (!existing || (existing.language !== lang && rt.language === lang)) {
        regionTranslationMap.set(rt.region, rt);
      }
    });

    const mappedProperties = properties.map((property) => {
      const regionTranslation = property.region
        ? regionTranslationMap.get(property.region)
        : null;

      const translation =
        property.translations.find(
          (t) => t.language === lang && t.title && t.title.trim(),
        ) || property.translations.find((t) => t.language === 'en' && t.title);

      return {
        id: property.id,
        externalId: property.externalId,
        propertyType: property.propertyType,
        dealType: property.dealType,
        location: property.location,
        region: property.region,
        regionName: regionTranslation?.name || null,
        address: property.address,
        price: property.price,
        hotSale: property.hotSale,
        public: property.public,
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
        translation: translation || null,
        galleryImages: property.galleryImages,
      };
    });

    return {
      data: mappedProperties,
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

  async findOne(id: string, lang = 'en', includePrivate = false) {
    const where: any = { id };

    if (!includePrivate) {
      where.public = true;
    }

    const property = await this.prismaService.property.findFirst({
      where,
      include: {
        translations: true,
        galleryImages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    const regionTranslation = await this.getRegionTranslation(
      property.region,
      lang,
    );

    const translation =
      property.translations.find(
        (t) => t.language === lang && t.title && t.title.trim(),
      ) || property.translations.find((t) => t.language === 'en' && t.title);

    return {
      id: property.id,
      externalId: property.externalId,
      propertyType: property.propertyType,
      dealType: property.dealType,
      location: property.location,
      region: property.region,
      regionName: regionTranslation?.name || null,
      address: property.address,
      price: property.price,
      hotSale: property.hotSale,
      public: property.public,
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
      translation: translation || null,
      galleryImages: property.galleryImages,
    };
  }

  async createProperty(dto: CreatePropertyDto, images?: Express.Multer.File[]) {
    const generatedExternalId = await this.generateUniqueExternalId();

    const property = await this.prismaService.property.create({
      data: {
        externalId: generatedExternalId,
        propertyType: dto.propertyType,
        dealType: dto.dealType,
        location: dto.location || null,
        region: dto.region || null,
        address: dto.address || null,
        hotSale: dto.hotSale || false,
        public: dto.public !== undefined ? dto.public : true,
        price: dto.price ? parseInt(dto.price as any) : null,
        totalArea: dto.totalArea ? parseInt(dto.totalArea as any) : null,
        rooms: dto.rooms ? parseInt(dto.rooms as any) : null,
        bedrooms: dto.bedrooms ? parseInt(dto.bedrooms as any) : null,
        bathrooms: dto.bathrooms ? parseInt(dto.bathrooms as any) : null,
        floors: dto.floors ? parseInt(dto.floors as any) : null,
        floorsTotal: dto.floorsTotal ? parseInt(dto.floorsTotal as any) : null,
        ceilingHeight: dto.ceilingHeight
          ? parseFloat(dto.ceilingHeight as any)
          : null,
        isNonStandard: dto.isNonStandard || false,
        occupancy: dto.occupancy,
        heating: dto.heating,
        hotWater: dto.hotWater,
        parking: dto.parking,
        hasConditioner: dto.hasConditioner || false,
        hasFurniture: dto.hasFurniture || false,
        hasBed: dto.hasBed || false,
        hasSofa: dto.hasSofa || false,
        hasTable: dto.hasTable || false,
        hasChairs: dto.hasChairs || false,
        hasStove: dto.hasStove || false,
        hasRefrigerator: dto.hasRefrigerator || false,
        hasOven: dto.hasOven || false,
        hasWashingMachine: dto.hasWashingMachine || false,
        hasKitchenAppliances: dto.hasKitchenAppliances || false,
        hasBalcony: dto.hasBalcony || false,
        balconyArea: dto.balconyArea
          ? parseFloat(dto.balconyArea as any)
          : null,
        hasNaturalGas: dto.hasNaturalGas || false,
        hasInternet: dto.hasInternet || false,
        hasTV: dto.hasTV || false,
        hasSewerage: dto.hasSewerage || false,
        isFenced: dto.isFenced || false,
        hasYardLighting: dto.hasYardLighting || false,
        hasGrill: dto.hasGrill || false,
        hasAlarm: dto.hasAlarm || false,
        hasVentilation: dto.hasVentilation || false,
        hasWater: dto.hasWater || false,
        hasElectricity: dto.hasElectricity || false,
        hasGate: dto.hasGate || false,
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

    if (images && images.length > 0) {
      const imageUrls = images
        .map((image, index) => ({
          url: FileUtils.generateImageUrl(image, 'properties'),
          order: index,
        }))
        .filter((item) => item.url !== null);

      if (imageUrls.length > 0) {
        await this.prismaService.propertyGalleryImage.createMany({
          data: imageUrls.map((item) => ({
            propertyId: property.id,
            imageUrl: item.url as string,
            order: item.order,
          })),
        });
      }
    }

    return this.findOne(property.id, 'en', true);
  }

  async updateProperty(
    id: string,
    dto: UpdatePropertyDto,
    images?: Express.Multer.File[],
  ) {
    const property = await this.prismaService.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    const updateData: any = {};

    if (dto.propertyType !== undefined)
      updateData.propertyType = dto.propertyType;
    if (dto.dealType !== undefined) updateData.dealType = dto.dealType;
    if (dto.location !== undefined) updateData.location = dto.location || null;
    if (dto.region !== undefined) updateData.region = dto.region || null;
    if (dto.address !== undefined) updateData.address = dto.address || null;
    if (dto.hotSale !== undefined) updateData.hotSale = dto.hotSale;
    if (dto.public !== undefined) updateData.public = dto.public;
    if (dto.price !== undefined)
      updateData.price = dto.price ? parseInt(dto.price as any) : null;
    if (dto.totalArea !== undefined)
      updateData.totalArea = dto.totalArea
        ? parseInt(dto.totalArea as any)
        : null;
    if (dto.rooms !== undefined)
      updateData.rooms = dto.rooms ? parseInt(dto.rooms as any) : null;
    if (dto.bedrooms !== undefined)
      updateData.bedrooms = dto.bedrooms ? parseInt(dto.bedrooms as any) : null;
    if (dto.bathrooms !== undefined)
      updateData.bathrooms = dto.bathrooms
        ? parseInt(dto.bathrooms as any)
        : null;
    if (dto.floors !== undefined)
      updateData.floors = dto.floors ? parseInt(dto.floors as any) : null;
    if (dto.floorsTotal !== undefined)
      updateData.floorsTotal = dto.floorsTotal
        ? parseInt(dto.floorsTotal as any)
        : null;
    if (dto.ceilingHeight !== undefined)
      updateData.ceilingHeight = dto.ceilingHeight
        ? parseFloat(dto.ceilingHeight as any)
        : null;
    if (dto.isNonStandard !== undefined)
      updateData.isNonStandard = dto.isNonStandard;
    if (dto.occupancy !== undefined) updateData.occupancy = dto.occupancy;
    if (dto.heating !== undefined) updateData.heating = dto.heating;
    if (dto.hotWater !== undefined) updateData.hotWater = dto.hotWater;
    if (dto.parking !== undefined) updateData.parking = dto.parking;

    if (dto.hasConditioner !== undefined)
      updateData.hasConditioner = dto.hasConditioner;
    if (dto.hasFurniture !== undefined)
      updateData.hasFurniture = dto.hasFurniture;
    if (dto.hasBed !== undefined) updateData.hasBed = dto.hasBed;
    if (dto.hasSofa !== undefined) updateData.hasSofa = dto.hasSofa;
    if (dto.hasTable !== undefined) updateData.hasTable = dto.hasTable;
    if (dto.hasChairs !== undefined) updateData.hasChairs = dto.hasChairs;
    if (dto.hasStove !== undefined) updateData.hasStove = dto.hasStove;
    if (dto.hasRefrigerator !== undefined)
      updateData.hasRefrigerator = dto.hasRefrigerator;
    if (dto.hasOven !== undefined) updateData.hasOven = dto.hasOven;
    if (dto.hasWashingMachine !== undefined)
      updateData.hasWashingMachine = dto.hasWashingMachine;
    if (dto.hasKitchenAppliances !== undefined)
      updateData.hasKitchenAppliances = dto.hasKitchenAppliances;
    if (dto.hasBalcony !== undefined) updateData.hasBalcony = dto.hasBalcony;
    if (dto.balconyArea !== undefined)
      updateData.balconyArea = dto.balconyArea
        ? parseFloat(dto.balconyArea as any)
        : null;
    if (dto.hasNaturalGas !== undefined)
      updateData.hasNaturalGas = dto.hasNaturalGas;
    if (dto.hasInternet !== undefined) updateData.hasInternet = dto.hasInternet;
    if (dto.hasTV !== undefined) updateData.hasTV = dto.hasTV;
    if (dto.hasSewerage !== undefined) updateData.hasSewerage = dto.hasSewerage;
    if (dto.isFenced !== undefined) updateData.isFenced = dto.isFenced;
    if (dto.hasYardLighting !== undefined)
      updateData.hasYardLighting = dto.hasYardLighting;
    if (dto.hasGrill !== undefined) updateData.hasGrill = dto.hasGrill;
    if (dto.hasAlarm !== undefined) updateData.hasAlarm = dto.hasAlarm;
    if (dto.hasVentilation !== undefined)
      updateData.hasVentilation = dto.hasVentilation;
    if (dto.hasWater !== undefined) updateData.hasWater = dto.hasWater;
    if (dto.hasElectricity !== undefined)
      updateData.hasElectricity = dto.hasElectricity;
    if (dto.hasGate !== undefined) updateData.hasGate = dto.hasGate;

    const updatedProperty = await this.prismaService.property.update({
      where: { id },
      data: updateData,
    });

    if (images && images.length > 0) {
      const existingImages =
        await this.prismaService.propertyGalleryImage.findMany({
          where: { propertyId: id },
        });
      const maxOrder = existingImages.length;

      const imageUrls = images
        .map((image, index) => ({
          url: FileUtils.generateImageUrl(image, 'properties'),
          order: maxOrder + index,
        }))
        .filter((item) => item.url !== null);

      if (imageUrls.length > 0) {
        await this.prismaService.propertyGalleryImage.createMany({
          data: imageUrls.map((item) => ({
            propertyId: id,
            imageUrl: item.url as string,
            order: item.order,
          })),
        });
      }
    }

    return this.findOne(updatedProperty.id, 'en', true);
  }

  async deleteProperty(id: string) {
    const property = await this.prismaService.property.findUnique({
      where: { id },
      include: {
        galleryImages: true,
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    for (const image of property.galleryImages) {
      await FileUtils.deleteFile(image.imageUrl);
    }

    await this.prismaService.property.delete({
      where: { id },
    });

    return { message: 'Property deleted successfully' };
  }

  async getTranslations(propertyId: string) {
    const property = await this.prismaService.property.findUnique({
      where: { id: propertyId },
      include: {
        translations: {
          orderBy: { language: 'asc' },
        },
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${propertyId}" not found`);
    }

    await TranslationSyncUtil.syncMissingTranslations(this.prismaService, {
      entityId: propertyId as any,
      entityIdField: 'propertyId',
      translationModel: this.prismaService.propertyTranslations,
      existingTranslations: property.translations,
      defaultFields: {
        title: '',
        address: null,
        description: null,
      },
    });

    const updatedProperty = await this.prismaService.property.findUnique({
      where: { id: propertyId },
      include: {
        translations: {
          orderBy: { language: 'asc' },
        },
      },
    });

    return updatedProperty!.translations;
  }

  async upsertTranslation(
    propertyId: string,
    language: string,
    title: string,
    address?: string,
    description?: string,
  ) {
    const property = await this.prismaService.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${propertyId}" not found`);
    }

    const translation = await this.prismaService.propertyTranslations.upsert({
      where: {
        propertyId_language: {
          propertyId,
          language,
        },
      },
      update: {
        title,
        address: address || null,
        description: description || null,
      },
      create: {
        propertyId,
        language,
        title,
        address: address || null,
        description: description || null,
      },
    });

    return translation;
  }

  async deleteTranslation(propertyId: string, language: string) {
    if (language === 'en') {
      throw new ConflictException('Cannot delete English translation');
    }

    const translation =
      await this.prismaService.propertyTranslations.findUnique({
        where: {
          propertyId_language: {
            propertyId,
            language,
          },
        },
      });

    if (!translation) {
      throw new NotFoundException(
        `Translation for language "${language}" not found`,
      );
    }

    await this.prismaService.propertyTranslations.delete({
      where: {
        propertyId_language: {
          propertyId,
          language,
        },
      },
    });

    return { message: 'Translation deleted successfully' };
  }

  async deleteGalleryImage(propertyId: string, imageId: number) {
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
      () => ({
        title: '',
        address: null,
        description: null,
      }),
    );
  }
}
