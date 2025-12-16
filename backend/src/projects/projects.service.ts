import { PrismaService } from '@/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/CreateProject.dto';
import { FileUtils } from '@/common/utils/file.utils';
import { UpdateProjectDto } from './dto/UpdateProject.dto';
import { TranslationSyncUtil } from '@/common/utils/translation-sync.util';
import { Region } from '@prisma/client';

interface FindAllParams {
  lang?: string;
  page?: number;
  limit?: number;
  location?: string;
  region?: Region;
  priceFrom?: number;
  priceTo?: number;
  partnerId?: number;
  public?: boolean;
}

@Injectable()
export class ProjectsService {
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
    const { lang = 'en', page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (params.location) {
      where.location = params.location;
    }

    if (params.region) {
      where.region = params.region;
    }

    if (params.priceFrom !== undefined && params.priceTo !== undefined) {
      where.priceFrom = { gte: params.priceFrom };
      where.priceTo = { lte: params.priceTo };
    }

    if (params.partnerId !== undefined) {
      where.partnerId = params.partnerId;
    }

    if (params.public !== undefined) {
      where.public = params.public;
    }

    const total = await this.prismaService.projects.count({ where });

    const projects = await this.prismaService.projects.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { hotSale: 'desc' },
        { updatedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        partner: {
          include: {
            translations: true,
          },
        },
        translations: true,
      },
    });

    const uniqueRegions = [
      ...new Set(projects.map((p) => p.region).filter(Boolean)),
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

    const mappedProjects = projects.map((project) => {
      const regionTranslation = project.region
        ? regionTranslationMap.get(project.region)
        : null;

      const translation =
        project.translations.find(
          (t) => t.language === lang && t.projectName && t.projectName.trim(),
        ) ||
        project.translations.find((t) => t.language === 'en' && t.projectName);

      const partnerTranslation =
        project.partner?.translations.find(
          (t) => t.language === lang && t.companyName && t.companyName.trim(),
        ) ||
        project.partner?.translations.find(
          (t) => t.language === 'en' && t.companyName,
        );

      return {
        id: project.id,
        projectName: project.projectName,
        location: project.location,
        street: project.street,
        region: project.region,
        regionName: regionTranslation?.name || null,
        image: project.image,
        gallery: project.gallery,
        priceFrom: project.priceFrom,
        deliveryDate: project.deliveryDate,
        numFloors: project.numFloors,
        numApartments: project.numApartments,
        hotSale: project.hotSale,
        public: project.public,
        createdAt: project.createdAt,
        translation: translation || null,
        partner: project.partner
          ? {
              id: project.partner.id,
              companyName: project.partner.companyName,
              image: project.partner.image,
              translation: partnerTranslation || null,
            }
          : null,
      };
    });

    return {
      data: mappedProjects,
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

  async findOne(id: number, lang = 'en') {
    const project = await this.prismaService.projects.findUnique({
      where: { id },
      include: {
        partner: {
          include: {
            translations: true,
          },
        },
        translations: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    const translation =
      project.translations.find(
        (t) => t.language === lang && t.projectName && t.projectName.trim(),
      ) ||
      project.translations.find((t) => t.language === 'en' && t.projectName);

    const partnerTranslation =
      project.partner?.translations.find(
        (t) => t.language === lang && t.companyName && t.companyName.trim(),
      ) ||
      project.partner?.translations.find(
        (t) => t.language === 'en' && t.companyName,
      );

    const regionTranslation = await this.getRegionTranslation(
      project.region,
      lang,
    );

    return {
      id: project.id,
      projectName: project.projectName,
      location: project.location,
      street: project.street,
      region: project.region,
      regionName: regionTranslation?.name || null,
      image: project.image,
      gallery: project.gallery,
      priceFrom: project.priceFrom,
      deliveryDate: project.deliveryDate,
      numFloors: project.numFloors,
      numApartments: project.numApartments,
      hotSale: project.hotSale,
      public: project.public,
      createdAt: project.createdAt,
      translation: translation || null,
      partner: project.partner
        ? {
            id: project.partner.id,
            companyName: project.partner.companyName,
            image: project.partner.image,
            translation: partnerTranslation || null,
          }
        : null,
    };
  }

  async createProject(
    dto: CreateProjectDto,
    image?: Express.Multer.File,
    gallery?: Express.Multer.File[],
  ) {
    await this.validatePartnerExists(dto.partnerId);

    const galleryUrls = gallery
      ? gallery
          .map((img) => FileUtils.generateImageUrl(img, 'projects'))
          .filter((url): url is string => url !== null)
      : [];

    const project = await this.prismaService.projects.create({
      data: {
        projectName: dto.projectName,
        location: dto.location ?? null,
        street: dto.street ?? null,
        region: dto.region ?? null,
        image: image ? FileUtils.generateImageUrl(image, 'projects') : null,
        gallery: galleryUrls,
        priceFrom: dto.priceFrom ?? null,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        numFloors: dto.numFloors ?? null,
        numApartments: dto.numApartments ?? null,
        hotSale: dto.hotSale ?? false,
        public: dto.public ?? true,
        partnerId: dto.partnerId,
      },
      include: {
        partner: true,
      },
    });

    await this.prismaService.projectTranslations.create({
      data: {
        projectId: project.id,
        language: 'en',
        projectName: dto.projectName,
        street: dto.street ?? null,
      },
    });

    return project;
  }

  async updateProject(
    id: number,
    dto: UpdateProjectDto,
    image?: Express.Multer.File,
    gallery?: Express.Multer.File[],
  ) {
    const project = await this.prismaService.projects.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    if (dto.partnerId !== undefined) {
      await this.validatePartnerExists(dto.partnerId);
    }

    let imagePath = project.image;

    if (image) {
      if (imagePath) {
        await FileUtils.deleteFile(imagePath);
      }
      imagePath = FileUtils.generateImageUrl(image, 'projects');
    }

    let galleryUrls = [...project.gallery];
    if (gallery && gallery.length > 0) {
      const newGalleryUrls = gallery
        .map((img) => FileUtils.generateImageUrl(img, 'projects'))
        .filter((url): url is string => url !== null);
      galleryUrls = [...galleryUrls, ...newGalleryUrls];
    }

    const updateData: any = {
      image: imagePath,
      gallery: galleryUrls,
    };

    if (dto.projectName !== undefined) {
      updateData.projectName = dto.projectName;
    }
    if (dto.location !== undefined) {
      updateData.location = dto.location;
    }
    if (dto.street !== undefined) {
      updateData.street = dto.street;
    }
    if (dto.region !== undefined) {
      updateData.region = dto.region;
    }
    if (dto.partnerId !== undefined) {
      updateData.partnerId = dto.partnerId;
    }
    if (dto.priceFrom !== undefined) {
      updateData.priceFrom = dto.priceFrom;
    }
    if (dto.deliveryDate !== undefined) {
      updateData.deliveryDate = new Date(dto.deliveryDate);
    }
    if (dto.numFloors !== undefined) {
      updateData.numFloors = dto.numFloors;
    }
    if (dto.numApartments !== undefined) {
      updateData.numApartments = dto.numApartments;
    }
    if (dto.hotSale !== undefined) {
      updateData.hotSale = dto.hotSale;
    }
    if (dto.public !== undefined) {
      updateData.public = dto.public;
    }

    const updatedProject = await this.prismaService.projects.update({
      where: { id },
      data: updateData,
      include: {
        partner: true,
      },
    });

    return updatedProject;
  }

  async deleteGalleryImage(id: number, imageIndex: number) {
    const project = await this.prismaService.projects.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    if (imageIndex < 0 || imageIndex >= project.gallery.length) {
      throw new BadRequestException(
        `Invalid image index. Project has ${project.gallery.length} gallery images.`,
      );
    }

    const imageToDelete = project.gallery[imageIndex];
    await FileUtils.deleteFile(imageToDelete);

    const updatedGallery = project.gallery.filter(
      (_, index) => index !== imageIndex,
    );

    await this.prismaService.projects.update({
      where: { id },
      data: {
        gallery: updatedGallery,
      },
    });

    return { message: 'Gallery image deleted successfully' };
  }

  async upsertTranslation(
    projectId: number,
    language: string,
    projectName: string,
    street?: string,
  ) {
    const project = await this.prismaService.projects.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found`);
    }

    const translation = await this.prismaService.projectTranslations.upsert({
      where: {
        projectId_language: {
          projectId,
          language,
        },
      },
      update: {
        projectName,
        street: street ?? null,
      },
      create: {
        projectId,
        language,
        projectName,
        street: street ?? null,
      },
    });

    return translation;
  }

  async getTranslations(projectId: number) {
    const project = await this.prismaService.projects.findUnique({
      where: { id: projectId },
      include: {
        translations: {
          orderBy: { language: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found`);
    }

    await TranslationSyncUtil.syncMissingTranslations(this.prismaService, {
      entityId: projectId,
      entityIdField: 'projectId',
      translationModel: this.prismaService.projectTranslations,
      existingTranslations: project.translations,
      defaultFields: { projectName: '', street: null },
    });

    const updatedProject = await this.prismaService.projects.findUnique({
      where: { id: projectId },
      include: {
        translations: {
          orderBy: { language: 'asc' },
        },
      },
    });

    return updatedProject!.translations;
  }

  async deleteTranslation(projectId: number, language: string) {
    if (language === 'en') {
      throw new ConflictException('Cannot delete English translation');
    }

    const translation = await this.prismaService.projectTranslations.findUnique(
      {
        where: {
          projectId_language: {
            projectId,
            language,
          },
        },
      },
    );

    if (!translation) {
      throw new NotFoundException(
        `Translation for language "${language}" not found`,
      );
    }

    await this.prismaService.projectTranslations.delete({
      where: {
        projectId_language: {
          projectId,
          language,
        },
      },
    });

    return { message: 'Translation deleted successfully' };
  }

  async deleteProject(id: number) {
    const project = await this.prismaService.projects.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    if (project.image) {
      await FileUtils.deleteFile(project.image);
    }

    if (project.gallery && project.gallery.length > 0) {
      for (const imagePath of project.gallery) {
        await FileUtils.deleteFile(imagePath);
      }
    }

    await this.prismaService.projects.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }

  async syncAllTranslations() {
    return TranslationSyncUtil.syncAllEntities(
      this.prismaService,
      this.prismaService.projects,
      'projectId',
      this.prismaService.projectTranslations,
      () => ({ projectName: '', street: null }),
    );
  }

  private async validatePartnerExists(partnerId: number): Promise<void> {
    const partner = await this.prismaService.partners.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new BadRequestException(
        `Partner with ID "${partnerId}" does not exist`,
      );
    }
  }
}
