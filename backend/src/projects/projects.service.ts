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

@Injectable()
export class ProjectsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(lang: string = 'en') {
    const projects = await this.prismaService.projects.findMany({
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

    return projects.map((project) => ({
      id: project.id,
      projectName: project.projectName,
      projectLocation: project.projectLocation,
      image: project.image,
      gallery: project.gallery,
      priceFrom: project.priceFrom,
      deliveryDate: project.deliveryDate,
      numFloors: project.numFloors,
      numApartments: project.numApartments,
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
    }));
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
    await this.validatePartnerExists(dto.partnerId);

    const existingProject = await this.prismaService.projects.findUnique({
      where: { projectName: dto.projectName },
    });

    if (existingProject) {
      throw new ConflictException(
        `Project "${dto.projectName}" already exists`,
      );
    }

    // Generate gallery URLs
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
        priceFrom: dto.priceFrom,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        numFloors: dto.numFloors,
        numApartments: dto.numApartments,
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
    const project = await this.prismaService.projects.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    if (dto.partnerId) {
      await this.validatePartnerExists(dto.partnerId);
    }

    let imagePath = project.image;

    if (image) {
      if (imagePath) {
        await FileUtils.deleteFile(imagePath);
      }
      imagePath = FileUtils.generateImageUrl(image, 'projects');
    }

    // Handle gallery images - add to existing
    let galleryUrls = [...project.gallery];
    if (gallery && gallery.length > 0) {
      const newGalleryUrls = gallery
        .map((img) => FileUtils.generateImageUrl(img, 'projects'))
        .filter((url): url is string => url !== null);
      galleryUrls = [...galleryUrls, ...newGalleryUrls];
    }

    const updatedProject = await this.prismaService.projects.update({
      where: { id },
      data: {
        ...(dto.projectName && { projectName: dto.projectName }),
        ...(dto.projectLocation && { projectLocation: dto.projectLocation }),
        ...(dto.partnerId && { partnerId: dto.partnerId }),
        ...(dto.priceFrom !== undefined && { priceFrom: dto.priceFrom }),
        ...(dto.deliveryDate && { deliveryDate: new Date(dto.deliveryDate) }),
        ...(dto.numFloors !== undefined && { numFloors: dto.numFloors }),
        ...(dto.numApartments !== undefined && {
          numApartments: dto.numApartments,
        }),
        image: imagePath,
        gallery: galleryUrls,
      },
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

    // Delete the file from storage
    await FileUtils.deleteFile(imageToDelete);

    // Remove image from array
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

    // Delete main image
    if (project.image) {
      await FileUtils.deleteFile(project.image);
    }

    // Delete all gallery images
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
