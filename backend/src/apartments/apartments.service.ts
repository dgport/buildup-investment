import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UpdateApartmentDto } from './dto/UpdateApartment.dto';
import { CreateApartmentDto } from './dto/CreateApartment.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { FileUtils } from '@/common/utils/file.utils';
import { TranslationSyncUtil } from '@/common/utils/translation-sync.util';
import { Region } from '@prisma/client';

interface FindAllParams {
  lang?: string;
  page?: number;
  limit?: number;
  projectId?: number;
  hotSale?: boolean;
}

@Injectable()
export class ApartmentsService {
  constructor(private readonly prismaService: PrismaService) {}

  private async getRegionTranslation(region: Region | null, lang: string) {
    if (!region) return null;

    const translation = await this.prismaService.regionTranslations.findFirst({
      where: {
        region: region,
        language: lang,
      },
    });

    // Fallback to English if translation not found
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
    const { lang = 'en', page = 1, limit = 10, projectId, hotSale } = params;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (hotSale !== undefined) {
      where.project = { hotSale };
    }

    const total = await this.prismaService.apartments.count({ where });

    const apartments = await this.prismaService.apartments.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        translations: true, // ✅ Fetch all translations
        project: {
          select: {
            id: true,
            projectName: true,
            location: true,
            street: true,
            region: true,
            image: true,
            gallery: true,
            priceFrom: true,
            deliveryDate: true,
            numFloors: true,
            numApartments: true,
            hotSale: true,
            translations: true, // ✅ Fetch all translations
          },
        },
      },
    });

    // Fetch region translations (both requested language and English fallback)
    const uniqueRegions = [
      ...new Set(apartments.map((a) => a.project?.region).filter(Boolean)),
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
      if (!existing || rt.language === lang) {
        regionTranslationMap.set(rt.region, rt);
      }
    });

    const mappedApartments = apartments.map((apartment) => {
      // ✅ Get translation with fallback to English (skip empty descriptions)
      const translation =
        apartment.translations.find(
          (t) => t.language === lang && t.description && t.description.trim(),
        ) ||
        apartment.translations.find(
          (t) => t.language === 'en' && t.description,
        );

      // ✅ Get project translation (projects may have different fields like projectName, street, etc.)
      const projectTranslation =
        apartment.project?.translations.find((t) => t.language === lang) ||
        apartment.project?.translations.find((t) => t.language === 'en');

      const regionTranslation = apartment.project?.region
        ? regionTranslationMap.get(apartment.project.region)
        : null;

      return {
        id: apartment.id,
        room: apartment.room,
        area: apartment.area,
        images: apartment.images,
        description: translation?.description || null,
        createdAt: apartment.createdAt,
        project: apartment.project
          ? {
              ...apartment.project,
              regionName: regionTranslation?.name || null,
              translation: projectTranslation || null,
            }
          : null,
      };
    });

    return {
      data: mappedApartments,
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

  async findOne(id: number, lang: string = 'en') {
    const apartment = await this.prismaService.apartments.findUnique({
      where: { id },
      include: {
        translations: true, // ✅ Fetch all translations
        project: {
          select: {
            id: true,
            projectName: true,
            location: true,
            street: true,
            region: true,
            image: true,
            translations: true, // ✅ Fetch all translations
          },
        },
      },
    });

    if (!apartment) {
      throw new NotFoundException(`Apartment with ID "${id}" not found`);
    }

    // ✅ Get translation with fallback to English (skip empty descriptions)
    const translation =
      apartment.translations.find(
        (t) => t.language === lang && t.description && t.description.trim(),
      ) ||
      apartment.translations.find((t) => t.language === 'en' && t.description);

    // ✅ Get project translation (projects may have different fields like projectName, street, etc.)
    const projectTranslation =
      apartment.project?.translations.find((t) => t.language === lang) ||
      apartment.project?.translations.find((t) => t.language === 'en');

    const regionTranslation = await this.getRegionTranslation(
      apartment.project?.region || null,
      lang,
    );

    return {
      id: apartment.id,
      room: apartment.room,
      area: apartment.area,
      images: apartment.images,
      description: translation?.description || null,
      createdAt: apartment.createdAt,
      project: apartment.project
        ? {
            ...apartment.project,
            regionName: regionTranslation?.name || null,
            translation: projectTranslation || null,
          }
        : null,
    };
  }

  async createApartment(
    dto: CreateApartmentDto,
    images?: Express.Multer.File[],
  ) {
    const project = await this.prismaService.projects.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new NotFoundException(
        `Project with ID "${dto.projectId}" not found`,
      );
    }

    const imageUrls = images
      ? images
          .map((image) => FileUtils.generateImageUrl(image, 'apartments'))
          .filter((url): url is string => url !== null)
      : [];

    const apartment = await this.prismaService.apartments.create({
      data: {
        room: dto.room,
        area: dto.area,
        images: imageUrls,
        projectId: dto.projectId,
      },
    });

    // ✅ Only create English translation initially
    // Other translations created on-demand when actually filled
    await this.prismaService.apartmentTranslations.create({
      data: {
        apartmentId: apartment.id,
        language: 'en',
        description: dto.description || '',
      },
    });

    return apartment;
  }

  async updateApartment(
    id: number,
    dto: UpdateApartmentDto,
    images?: Express.Multer.File[],
  ) {
    const apartment = await this.prismaService.apartments.findUnique({
      where: { id },
    });

    if (!apartment) {
      throw new NotFoundException(`Apartment with ID "${id}" not found`);
    }

    if (dto.projectId) {
      const project = await this.prismaService.projects.findUnique({
        where: { id: dto.projectId },
      });

      if (!project) {
        throw new NotFoundException(
          `Project with ID "${dto.projectId}" not found`,
        );
      }
    }

    let imageUrls: string[] = apartment.images.filter(
      (url): url is string => url !== null,
    );

    if (images && images.length > 0) {
      const newImageUrls = images
        .map((image) => FileUtils.generateImageUrl(image, 'apartments'))
        .filter((url): url is string => url !== null);
      imageUrls = [...imageUrls, ...newImageUrls];
    }

    const updateData: any = {
      images: imageUrls,
    };

    if (dto.room !== undefined) updateData.room = dto.room;
    if (dto.area !== undefined) updateData.area = dto.area;
    if (dto.projectId !== undefined) updateData.projectId = dto.projectId;

    const updatedApartment = await this.prismaService.apartments.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            location: true,
            street: true,
            region: true,
          },
        },
      },
    });

    return updatedApartment;
  }

  async deleteImage(id: number, imageIndex: number) {
    const apartment = await this.prismaService.apartments.findUnique({
      where: { id },
    });

    if (!apartment) {
      throw new NotFoundException(`Apartment with ID "${id}" not found`);
    }

    if (imageIndex < 0 || imageIndex >= apartment.images.length) {
      throw new BadRequestException(
        `Invalid image index. Apartment has ${apartment.images.length} images.`,
      );
    }

    const imageToDelete = apartment.images[imageIndex];

    await FileUtils.deleteFile(imageToDelete);

    const updatedImages = apartment.images.filter(
      (_, index) => index !== imageIndex,
    );

    await this.prismaService.apartments.update({
      where: { id },
      data: {
        images: updatedImages,
      },
    });

    return { message: 'Image deleted successfully' };
  }

  async upsertTranslation(
    apartmentId: number,
    language: string,
    description: string,
  ) {
    const apartment = await this.prismaService.apartments.findUnique({
      where: { id: apartmentId },
    });

    if (!apartment) {
      throw new NotFoundException(
        `Apartment with ID "${apartmentId}" not found`,
      );
    }

    const translation = await this.prismaService.apartmentTranslations.upsert({
      where: {
        apartmentId_language: {
          apartmentId,
          language,
        },
      },
      update: {
        description,
      },
      create: {
        apartmentId,
        language,
        description,
      },
    });

    return translation;
  }

  async getTranslations(apartmentId: number) {
    const apartment = await this.prismaService.apartments.findUnique({
      where: { id: apartmentId },
      include: {
        translations: {
          orderBy: { language: 'asc' },
        },
      },
    });

    if (!apartment) {
      throw new NotFoundException(
        `Apartment with ID "${apartmentId}" not found`,
      );
    }

    await TranslationSyncUtil.syncMissingTranslations(this.prismaService, {
      entityId: apartmentId,
      entityIdField: 'apartmentId',
      translationModel: this.prismaService.apartmentTranslations,
      existingTranslations: apartment.translations,
      defaultFields: { description: '' },
    });

    const updatedApartment = await this.prismaService.apartments.findUnique({
      where: { id: apartmentId },
      include: {
        translations: {
          orderBy: { language: 'asc' },
        },
      },
    });

    return updatedApartment!.translations;
  }

  async deleteTranslation(apartmentId: number, language: string) {
    if (language === 'en') {
      throw new ConflictException('Cannot delete English translation');
    }

    const translation =
      await this.prismaService.apartmentTranslations.findUnique({
        where: {
          apartmentId_language: {
            apartmentId,
            language,
          },
        },
      });

    if (!translation) {
      throw new NotFoundException(
        `Translation for language "${language}" not found`,
      );
    }

    await this.prismaService.apartmentTranslations.delete({
      where: {
        apartmentId_language: {
          apartmentId,
          language,
        },
      },
    });

    return { message: 'Translation deleted successfully' };
  }

  async deleteApartment(id: number) {
    const apartment = await this.prismaService.apartments.findUnique({
      where: { id },
    });

    if (!apartment) {
      throw new NotFoundException(`Apartment with ID "${id}" not found`);
    }

    if (apartment.images && apartment.images.length > 0) {
      for (const imagePath of apartment.images) {
        await FileUtils.deleteFile(imagePath);
      }
    }

    await this.prismaService.apartments.delete({
      where: { id },
    });

    return { message: 'Apartment deleted successfully' };
  }

  async syncAllTranslations() {
    return TranslationSyncUtil.syncAllEntities(
      this.prismaService,
      this.prismaService.apartments,
      'apartmentId',
      this.prismaService.apartmentTranslations,
      () => ({ description: '' }),
    );
  }
}
