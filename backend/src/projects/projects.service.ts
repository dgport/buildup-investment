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
import { LANGUAGES } from '@/common/constants/language';

interface FindAllParams {
  lang?: string;
  page?: number;
  limit?: number;
  location?: string;
  priceFrom?: number;
  priceTo?: number;
  partnerId?: number;
  public?: boolean;
}

@Injectable()
export class ProjectsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(params: FindAllParams = {}) {
    const {
      lang = 'en',
      page = 1,
      limit = 9,
      location,
      priceFrom,
      priceTo,
      partnerId,
      public: isPublic,
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (location) {
      where.translations = {
        some: {
          language: lang,
          projectLocation: {
            contains: location,
            mode: 'insensitive',
          },
        },
      };
    }

    if (priceFrom !== undefined || priceTo !== undefined) {
      where.priceFrom = {};
      if (priceFrom !== undefined) {
        where.priceFrom.gte = priceFrom;
      }
      if (priceTo !== undefined) {
        where.priceFrom.lte = priceTo;
      }
    }

    if (partnerId !== undefined) {
      where.partnerId = partnerId;
    }

    if (isPublic !== undefined) {
      where.public = isPublic;
    } else {
      where.public = true;
    }

    const total = await this.prismaService.projects.count({ where });

    const projects = await this.prismaService.projects.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { hotSale: 'desc' }, // 1st priority: hot sales first
        { updatedAt: 'desc' }, // 2nd priority: most recently updated
        { createdAt: 'desc' }, // 3rd priority: most recently created
      ],
      include: {
        partner: {
          include: {
            translations: {
              where: { language: lang },
              take: 1,
            },
          },
        },
        translations: {
          where: { language: lang },
          take: 1,
        },
      },
    });

    const mappedProjects = projects.map((project) => ({
      id: project.id,
      projectName: project.projectName,
      projectLocation: project.projectLocation,
      image: project.image,
      gallery: project.gallery,
      priceFrom: project.priceFrom,
      deliveryDate: project.deliveryDate,
      numFloors: project.numFloors,
      numApartments: project.numApartments,
      hotSale: project.hotSale,
      public: project.public,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt, // Add this to the response if you want
      translation: project.translations[0] || null,
      partner: project.partner
        ? {
            id: project.partner.id,
            companyName: project.partner.companyName,
            image: project.partner.image,
            translation: project.partner.translations[0] || null,
          }
        : null,
    }));

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

  async findOne(id: number, lang: string = 'en') {
    const project = await this.prismaService.projects.findUnique({
      where: { id },
      include: {
        partner: {
          include: {
            translations: {
              where: { language: lang },
              take: 1,
            },
          },
        },
        translations: {
          where: { language: lang },
          take: 1,
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    return {
      id: project.id,
      projectName: project.projectName,
      projectLocation: project.projectLocation,
      image: project.image,
      gallery: project.gallery,
      priceFrom: project.priceFrom,
      deliveryDate: project.deliveryDate,
      numFloors: project.numFloors,
      numApartments: project.numApartments,
      hotSale: project.hotSale,
      public: project.public,
      createdAt: project.createdAt,
      translation: project.translations[0] || null,
      partner: project.partner
        ? {
            id: project.partner.id,
            companyName: project.partner.companyName,
            image: project.partner.image,
            translation: project.partner.translations[0] || null,
          }
        : null,
    };
  }

  async createProject(
    dto: CreateProjectDto,
    image?: Express.Multer.File,
    gallery?: Express.Multer.File[],
  ) {
    console.log('=== CREATE PROJECT DEBUG ===');
    console.log('DTO received:', dto);

    await this.validatePartnerExists(dto.partnerId);

    const existingProject = await this.prismaService.projects.findUnique({
      where: { projectName: dto.projectName },
    });

    if (existingProject) {
      throw new ConflictException(
        `Project "${dto.projectName}" already exists`,
      );
    }

    const galleryUrls = gallery
      ? gallery
          .map((img) => FileUtils.generateImageUrl(img, 'projects'))
          .filter((url): url is string => url !== null)
      : [];

    const project = await this.prismaService.projects.create({
      data: {
        projectName: dto.projectName,
        projectLocation: dto.projectLocation,
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

    await this.prismaService.projectTranslations.createMany({
      data: LANGUAGES.map((lang) => ({
        projectId: project.id,
        language: lang,
        projectName: lang === 'en' ? dto.projectName : '',
        projectLocation: lang === 'en' ? dto.projectLocation : '',
      })),
      skipDuplicates: true,
    });

    return project;
  }

  async updateProject(
    id: number,
    dto: UpdateProjectDto,
    image?: Express.Multer.File,
    gallery?: Express.Multer.File[],
  ) {
    console.log('=== UPDATE PROJECT DEBUG ===');
    console.log('Project ID:', id);
    console.log('DTO received:', dto);
    console.log('Types:', {
      priceFrom: typeof dto.priceFrom,
      numFloors: typeof dto.numFloors,
      numApartments: typeof dto.numApartments,
      hotSale: typeof dto.hotSale,
      public: typeof dto.public,
      partnerId: typeof dto.partnerId,
    });

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

    // Build update data object - only include fields that are actually provided
    const updateData: any = {
      image: imagePath,
      gallery: galleryUrls,
    };

    if (dto.projectName !== undefined) {
      updateData.projectName = dto.projectName;
    }
    if (dto.projectLocation !== undefined) {
      updateData.projectLocation = dto.projectLocation;
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

    console.log('Update data:', updateData);

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
    projectLocation: string,
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
        projectLocation,
      },
      create: {
        projectId,
        language,
        projectName,
        projectLocation,
      },
    });

    return translation;
  }

  async getTranslations(projectId: number) {
    const project = await this.prismaService.projects.findUnique({
      where: { id: projectId },
      include: {
        translations: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found`);
    }

    return project.translations;
  }

  async deleteTranslation(projectId: number, language: string) {
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
