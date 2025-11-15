import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdatePartnerDto } from './dto/UpdatePartner.dto';
import { CreatePartnerDto } from './dto/CreatePartner.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { FileUtils } from '@/common/utils/file.utils';
import { LANGUAGES } from '@/common/constants/language';

interface FindAllParams {
  lang?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class PartnersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(params: FindAllParams = {}) {
    const { lang = 'en', page = 1, limit = 10 } = params;

    const skip = (page - 1) * limit;

    const total = await this.prismaService.partners.count();

    const partners = await this.prismaService.partners.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        translations: {
          where: { language: lang },
          take: 1,
        },
      },
    });

    const mappedPartners = partners.map((partner) => ({
      id: partner.id,
      companyName: partner.companyName,
      image: partner.image,
      createdAt: partner.createdAt,
      translation: partner.translations[0] || null,
    }));

    return {
      data: mappedPartners,
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

  async createPartner(dto: CreatePartnerDto, image?: Express.Multer.File) {
    const existName = await this.prismaService.partners.findUnique({
      where: { companyName: dto.companyName },
    });

    if (existName) {
      throw new ConflictException(
        `Partner "${dto.companyName}" already exists`,
      );
    }

    const partner = await this.prismaService.partners.create({
      data: {
        companyName: dto.companyName,
        image: image ? FileUtils.generateImageUrl(image, 'partners') : null,
      },
    });

    await this.prismaService.partnerTranslations.createMany({
      data: LANGUAGES.map((lang) => ({
        partnerId: partner.id,
        language: lang,
        companyName: lang === 'en' ? dto.companyName : '',
      })),
      skipDuplicates: true,
    });

    return partner;
  }

  async updatePartner(
    id: number,
    dto: UpdatePartnerDto,
    image?: Express.Multer.File,
  ) {
    const partner = await this.prismaService.partners.findUnique({
      where: { id },
    });

    if (!partner) {
      throw new NotFoundException(`Partner with ID "${id}" not found`);
    }

    let imagePath = partner.image;

    if (image) {
      if (imagePath) {
        await FileUtils.deleteFile(imagePath);
      }
      imagePath = FileUtils.generateImageUrl(image, 'partners');
    }

    const updatedPartner = await this.prismaService.partners.update({
      where: { id },
      data: {
        image: imagePath,
      },
    });

    return updatedPartner;
  }

  async upsertTranslation(
    partnerId: number,
    language: string,
    companyName: string,
  ) {
    const partner = await this.prismaService.partners.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException(`Partner with ID "${partnerId}" not found`);
    }

    const translation = await this.prismaService.partnerTranslations.upsert({
      where: {
        partnerId_language: {
          partnerId,
          language,
        },
      },
      update: {
        companyName,
      },
      create: {
        partnerId,
        language,
        companyName,
      },
    });

    return translation;
  }

  async getTranslations(partnerId: number) {
    const partner = await this.prismaService.partners.findUnique({
      where: { id: partnerId },
      include: {
        translations: true,
      },
    });

    if (!partner) {
      throw new NotFoundException(`Partner with ID "${partnerId}" not found`);
    }

    return partner.translations;
  }

  async deleteTranslation(partnerId: number, language: string) {
    const translation = await this.prismaService.partnerTranslations.findUnique(
      {
        where: {
          partnerId_language: {
            partnerId,
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

    await this.prismaService.partnerTranslations.delete({
      where: {
        partnerId_language: {
          partnerId,
          language,
        },
      },
    });

    return { message: 'Translation deleted successfully' };
  }

  async deletePartner(id: number) {
    const partner = await this.prismaService.partners.findUnique({
      where: { id },
      include: {
        projects: true,
      },
    });

    if (!partner) {
      throw new NotFoundException(`Partner with ID "${id}" not found`);
    }

    if (partner.projects && partner.projects.length > 0) {
      throw new ConflictException(
        `Cannot delete partner "${partner.companyName}" because it has ${partner.projects.length} associated project(s). Please delete or reassign the projects first.`,
      );
    }

    if (partner.image) {
      await FileUtils.deleteFile(partner.image);
    }

    await this.prismaService.partners.delete({
      where: { id },
    });

    return { message: 'Partner deleted successfully' };
  }
}
