import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { FileUtils } from '@/common/utils/file.utils';
import { LANGUAGES, Language } from '@/common/constants/language';
import { uniqueSlug } from '@/common/utils/slug.util';
import { CreateDeveloperDto, UpdateDeveloperDto } from './dto/developer.dto';

const DEVELOPER_INCLUDE = {
  translations: true,
  _count: { select: { projects: { where: { published: true } } } },
} satisfies Prisma.DeveloperInclude;

type DeveloperRow = Prisma.DeveloperGetPayload<{
  include: typeof DEVELOPER_INCLUDE;
}>;

export const pickTranslation = <T extends { language: string }>(
  rows: T[],
  lang: string,
  hasContent: (row: T) => boolean = () => true,
): T | undefined =>
  rows.find((r) => r.language === lang && hasContent(r)) ??
  // Georgian is the site's primary language, English is the second fallback
  rows.find((r) => r.language === 'ka' && hasContent(r)) ??
  rows.find((r) => r.language === 'en' && hasContent(r)) ??
  rows.find(hasContent);

@Injectable()
export class DevelopersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public shape of a developer. */
  mapDeveloper(dev: DeveloperRow, lang: string, includeAll = false) {
    const translation = pickTranslation(
      dev.translations,
      lang,
      (t) => !!t.description?.trim(),
    );
    return {
      id: dev.id,
      slug: dev.slug,
      name: dev.name,
      logo: dev.logo,
      website: dev.website,
      phone: dev.phone,
      email: dev.email,
      foundedYear: dev.foundedYear,
      published: dev.published,
      description: translation?.description ?? null,
      projectsCount: dev._count.projects,
      ...(includeAll && { translations: dev.translations }),
      createdAt: dev.createdAt,
      updatedAt: dev.updatedAt,
    };
  }

  async findAll(lang: string, includeUnpublished = false) {
    const rows = await this.prisma.developer.findMany({
      where: includeUnpublished ? {} : { published: true },
      include: DEVELOPER_INCLUDE,
      orderBy: { name: 'asc' },
    });
    return rows.map((d) => this.mapDeveloper(d, lang, includeUnpublished));
  }

  async findOne(idOrSlug: string, lang: string, includeUnpublished = false) {
    const dev = await this.prisma.developer.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        ...(includeUnpublished ? {} : { published: true }),
      },
      include: DEVELOPER_INCLUDE,
    });
    if (!dev) throw new NotFoundException('Developer not found');
    return this.mapDeveloper(dev, lang, includeUnpublished);
  }

  async create(dto: CreateDeveloperDto) {
    const slug = await this.resolveSlug(dto.slug ?? null, dto.name);

    const dev = await this.prisma.developer.create({
      data: {
        slug,
        name: dto.name,
        website: dto.website ?? null,
        phone: dto.phone ?? null,
        email: dto.email ?? null,
        foundedYear: dto.foundedYear ?? null,
        published: dto.published ?? true,
        translations: {
          create: LANGUAGES.map((language) => ({
            language,
            description: this.descriptionFor(dto, language) ?? null,
          })),
        },
      },
      include: DEVELOPER_INCLUDE,
    });
    return this.mapDeveloper(dev, 'en', true);
  }

  async update(id: string, dto: UpdateDeveloperDto) {
    const existing = await this.prisma.developer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Developer not found');

    const data: Prisma.DeveloperUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slug !== undefined && dto.slug && dto.slug !== existing.slug) {
      data.slug = await this.resolveSlug(
        dto.slug,
        dto.name ?? existing.name,
        id,
      );
    }
    for (const key of ['website', 'phone', 'email', 'foundedYear'] as const) {
      if (dto[key] !== undefined)
        (data as Record<string, unknown>)[key] = dto[key];
    }
    if (typeof dto.published === 'boolean') data.published = dto.published;

    await this.prisma.developer.update({ where: { id }, data });

    for (const language of LANGUAGES) {
      const description = this.descriptionFor(dto, language);
      if (description === undefined) continue;
      await this.prisma.developerTranslation.upsert({
        where: { developerId_language: { developerId: id, language } },
        create: { developerId: id, language, description },
        update: { description },
      });
    }

    return this.findOne(id, 'en', true);
  }

  async setLogo(id: string, file: Express.Multer.File | undefined) {
    const dev = await this.prisma.developer.findUnique({ where: { id } });
    if (!dev) {
      await FileUtils.deleteFile(
        FileUtils.generateImageUrl(file, 'developers') ?? '',
      );
      throw new NotFoundException('Developer not found');
    }
    const [valid] = await FileUtils.optimizeImages(
      await FileUtils.keepOnlyRealImages(file ? [file] : []),
    );
    const url = FileUtils.generateImageUrl(valid, 'developers');
    if (!url) throw new ConflictException('No valid logo file received');

    if (dev.logo) await FileUtils.deleteFile(dev.logo);
    await this.prisma.developer.update({ where: { id }, data: { logo: url } });
    return this.findOne(id, 'en', true);
  }

  async removeLogo(id: string) {
    const dev = await this.prisma.developer.findUnique({ where: { id } });
    if (!dev) throw new NotFoundException('Developer not found');
    if (dev.logo) await FileUtils.deleteFile(dev.logo);
    await this.prisma.developer.update({ where: { id }, data: { logo: null } });
    return { message: 'Logo removed' };
  }

  async remove(id: string) {
    const dev = await this.prisma.developer.findUnique({
      where: { id },
      include: { _count: { select: { projects: true } } },
    });
    if (!dev) throw new NotFoundException('Developer not found');
    if (dev._count.projects > 0) {
      throw new ConflictException(
        `Developer still has ${dev._count.projects} project(s); delete or reassign them first`,
      );
    }
    if (dev.logo) await FileUtils.deleteFile(dev.logo);
    await this.prisma.developer.delete({ where: { id } });
    return { message: 'Developer deleted' };
  }

  // ─── helpers ──────────────────────────────────────────────────────────────

  private descriptionFor(
    dto: Partial<CreateDeveloperDto>,
    language: Language,
  ): string | null | undefined {
    return {
      ka: dto.descriptionKa,
      en: dto.descriptionEn,
      ru: dto.descriptionRu,
    }[language];
  }

  private async resolveSlug(
    requested: string | null,
    name: string,
    excludeId?: string,
  ) {
    const exists = async (slug: string) =>
      !!(await this.prisma.developer.findFirst({
        where: { slug, ...(excludeId && { id: { not: excludeId } }) },
        select: { id: true },
      }));

    if (requested) {
      if (await exists(requested)) {
        throw new ConflictException(`Slug "${requested}" is already used`);
      }
      return requested;
    }
    return uniqueSlug(name, exists);
  }
}
