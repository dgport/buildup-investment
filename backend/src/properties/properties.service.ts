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

interface FindAllParams {
  lang?: string;
  page?: number;
  limit?: number;

  externalId?: string; // ADD THIS
  city?: string;
  propertyType?: string;

  address?: string;
  priceFrom?: number;
  priceTo?: number;
  hotSale?: boolean;
  public?: boolean;

  // Additional filters
  status?: string;
  dealType?: string;
  areaFrom?: number;
  areaTo?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  condition?: string;
  heating?: string;
  parking?: string;

  // Boolean filters
  hasConditioner?: boolean;
  hasFurniture?: boolean;
  hasBalcony?: boolean;
  hasInternet?: boolean;
  hasNaturalGas?: boolean;
  hasParking?: boolean;
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

  async findAll(params: FindAllParams = {}) {
    const {
      lang = 'en',
      externalId,
      page = 1,
      limit = 10,
      city,
      propertyType,
      address,
      priceFrom,
      priceTo,
      hotSale,
      public: isPublic,
      status,
      dealType,
      areaFrom,
      areaTo,
      rooms,
      bedrooms,
      bathrooms,
      floors,
      condition,
      heating,
      parking,
      hasConditioner,
      hasFurniture,
      hasBalcony,
      hasInternet,
      hasNaturalGas,
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (externalId) {
      where.externalId = { contains: externalId, mode: 'insensitive' };
    }

    // Main filters
    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (dealType) where.dealType = dealType;
    if (hotSale !== undefined) where.hotSale = hotSale;
    if (isPublic !== undefined) where.public = isPublic;

    // Address filter (searches in base address and translations)
    if (address) {
      where.OR = [
        { address: { contains: address, mode: 'insensitive' } },
        {
          translations: {
            some: {
              address: { contains: address, mode: 'insensitive' },
              language: lang,
            },
          },
        },
      ];
    }

    // Price range filter
    if (priceFrom !== undefined || priceTo !== undefined) {
      where.price = {};
      if (priceFrom !== undefined) where.price.gte = priceFrom;
      if (priceTo !== undefined) where.price.lte = priceTo;
    }

    // Additional filters
    if (status) where.status = status;

    if (areaFrom !== undefined || areaTo !== undefined) {
      where.totalArea = {};
      if (areaFrom !== undefined) where.totalArea.gte = areaFrom;
      if (areaTo !== undefined) where.totalArea.lte = areaTo;
    }

    // Room filters with "or more" logic
    if (rooms !== undefined) {
      if (rooms >= 5) {
        where.rooms = { gte: 5 };
      } else {
        where.rooms = rooms;
      }
    }

    if (bedrooms !== undefined) {
      if (bedrooms >= 4) {
        where.bedrooms = { gte: 4 };
      } else {
        where.bedrooms = bedrooms;
      }
    }

    if (bathrooms !== undefined) {
      if (bathrooms >= 3) {
        where.bathrooms = { gte: 3 };
      } else {
        where.bathrooms = bathrooms;
      }
    }

    if (floors !== undefined) where.floors = floors;
    if (condition) where.condition = condition;
    if (heating) where.heating = heating;
    if (parking) where.parking = parking;

    // Boolean amenity filters
    if (hasConditioner === true) where.hasConditioner = true;
    if (hasFurniture === true) where.hasFurniture = true;
    if (hasBalcony === true) where.hasBalcony = true;
    if (hasInternet === true) where.hasInternet = true;
    if (hasNaturalGas === true) where.hasNaturalGas = true;

    const total = await this.prismaService.property.count({ where });

    const properties = await this.prismaService.property.findMany({
      skip,
      take: limit,
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        translations: {
          where: { language: lang },
          take: 1,
        },
        galleryImages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    const mappedProperties = properties.map((property) => ({
      ...property,
      translation: property.translations[0] || null,
      galleryImages: property.galleryImages,
    }));

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

  async findOne(id: string, lang = 'en') {
    const property = await this.prismaService.property.findUnique({
      where: { id },
      include: {
        translations: {
          where: { language: lang },
        },
        galleryImages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    return {
      ...property,
      translation: property.translations[0] || null,
    };
  }

  async createProperty(dto: CreatePropertyDto, images?: Express.Multer.File[]) {
    const generatedExternalId = await this.generateUniqueExternalId();

    const property = await this.prismaService.property.create({
      data: {
        externalId: generatedExternalId,
        propertyType: dto.propertyType,
        city: dto.city || null,
        address: dto.address || null,
        location: dto.location || null,
        status: dto.status,
        dealType: dto.dealType,
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
        condition: dto.condition,
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

    // Create translations for all languages
    await this.prismaService.propertyTranslations.createMany({
      data: LANGUAGES.map((lang) => ({
        propertyId: property.id,
        language: lang,
        title: lang === 'en' && dto.title ? dto.title : '',
        address: lang === 'en' && dto.address ? dto.address : null,
        description: lang === 'en' && dto.description ? dto.description : null,
        // Remove: location
      })),
      skipDuplicates: true,
    });

    // Handle gallery images
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

    return this.findOne(property.id);
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

    // Update all optional fields
    if (dto.propertyType !== undefined)
      updateData.propertyType = dto.propertyType;
    if (dto.city !== undefined) updateData.city = dto.city || null;
    if (dto.address !== undefined) updateData.address = dto.address || null;
    if (dto.location !== undefined) updateData.location = dto.location || null;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.dealType !== undefined) updateData.dealType = dto.dealType;
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
    if (dto.condition !== undefined) updateData.condition = dto.condition;
    if (dto.isNonStandard !== undefined)
      updateData.isNonStandard = dto.isNonStandard;
    if (dto.occupancy !== undefined) updateData.occupancy = dto.occupancy;
    if (dto.heating !== undefined) updateData.heating = dto.heating;
    if (dto.hotWater !== undefined) updateData.hotWater = dto.hotWater;
    if (dto.parking !== undefined) updateData.parking = dto.parking;

    // Boolean fields
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

    // Handle additional images
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

    return this.findOne(updatedProperty.id);
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
        // Remove: location: null
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
    // Remove: location?: string
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
        // Remove: location
      },
      create: {
        propertyId,
        language,
        title,
        address: address || null,
        description: description || null,
        // Remove: location
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
        // Remove: location: null
      }),
    );
  }
}
