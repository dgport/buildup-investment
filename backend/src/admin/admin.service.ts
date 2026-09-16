import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PropertyStatus, UserRole } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { pickTranslation } from '@/projects/developers.service';
import {
  ListUsersQueryDto,
  SETTING_KEYS,
  SettingKey,
  UpdateSettingsDto,
  UpdateUserDto,
} from './dto/admin.dto';

const USER_SELECT = {
  id: true,
  firstname: true,
  lastname: true,
  email: true,
  phone: true,
  role: true,
  method: true,
  isVerified: true,
  isActive: true,
  avatar: true,
  createdAt: true,
  lastLogin: true,
  listingTermsVersion: true,
  listingTermsAcceptedAt: true,
  _count: { select: { properties: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Overview ─────────────────────────────────────────────────────────────

  async getStats(lang = 'ka') {
    const since30d = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const [
      propertyGroups,
      hotSale,
      usersTotal,
      admins,
      usersNew,
      projectsTotal,
      projectsPublished,
      developers,
      leadsTotal,
      leadsNew,
      recentPending,
      recentLeads,
    ] = await Promise.all([
      this.prisma.property.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.property.count({
        where: { hotSale: true, status: PropertyStatus.APPROVED },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
      this.prisma.user.count({ where: { createdAt: { gte: since30d } } }),
      this.prisma.project.count(),
      this.prisma.project.count({ where: { published: true } }),
      this.prisma.developer.count(),
      this.prisma.projectLead.count(),
      this.prisma.projectLead.count({ where: { status: 'NEW' } }),
      this.prisma.property.findMany({
        where: { status: PropertyStatus.PENDING },
        orderBy: { createdAt: 'asc' },
        take: 6,
        select: {
          id: true,
          externalId: true,
          propertyType: true,
          dealType: true,
          price: true,
          createdAt: true,
          translations: { select: { language: true, title: true } },
          galleryImages: {
            orderBy: { order: 'asc' },
            take: 1,
            select: { imageUrl: true },
          },
          user: { select: { firstname: true, lastname: true } },
        },
      }),
      this.prisma.projectLead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          name: true,
          phone: true,
          status: true,
          createdAt: true,
          project: {
            select: {
              slug: true,
              translations: { select: { language: true, title: true } },
            },
          },
        },
      }),
    ]);

    const byStatus = Object.fromEntries(
      propertyGroups.map((g) => [g.status, g._count._all]),
    ) as Partial<Record<PropertyStatus, number>>;

    return {
      properties: {
        total: propertyGroups.reduce((s, g) => s + g._count._all, 0),
        approved: byStatus.APPROVED ?? 0,
        pending: byStatus.PENDING ?? 0,
        rejected: byStatus.REJECTED ?? 0,
        draft: byStatus.DRAFT ?? 0,
        hotSale,
      },
      users: { total: usersTotal, admins, newLast30d: usersNew },
      projects: {
        total: projectsTotal,
        published: projectsPublished,
        developers,
      },
      leads: { total: leadsTotal, new: leadsNew },
      recentPending: recentPending.map((p) => ({
        id: p.id,
        externalId: p.externalId,
        propertyType: p.propertyType,
        dealType: p.dealType,
        price: p.price,
        createdAt: p.createdAt,
        title: pickTranslation(p.translations, lang)?.title ?? null,
        coverImage: p.galleryImages[0]?.imageUrl ?? null,
        owner: p.user ? `${p.user.firstname} ${p.user.lastname}`.trim() : null,
      })),
      recentLeads: recentLeads.map((l) => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        status: l.status,
        createdAt: l.createdAt,
        project: {
          slug: l.project.slug,
          title:
            pickTranslation(l.project.translations, lang)?.title ??
            l.project.slug,
        },
      })),
    };
  }

  // ─── Users ────────────────────────────────────────────────────────────────

  async listUsers(query: ListUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const where: Prisma.UserWhereInput = {};
    if (query.role) where.role = query.role;
    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { firstname: { contains: q, mode: 'insensitive' } },
        { lastname: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
      ];
    }

    const [total, rows, roleGroups] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: USER_SELECT,
      }),
      this.prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      data: rows.map(({ _count, ...u }) => ({
        ...u,
        propertiesCount: _count.properties,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        counts: Object.fromEntries(
          roleGroups.map((g) => [g.role, g._count._all]),
        ),
      },
    };
  }

  async updateUser(id: string, dto: UpdateUserDto, actorId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const demoting =
      dto.role !== undefined &&
      dto.role !== UserRole.ADMIN &&
      user.role === UserRole.ADMIN;
    const deactivating = dto.isActive === false && user.isActive;

    if (id === actorId && (demoting || deactivating)) {
      throw new BadRequestException(
        'You cannot demote or deactivate your own account',
      );
    }
    if (user.role === UserRole.ADMIN && (demoting || deactivating)) {
      const activeAdmins = await this.prisma.user.count({
        where: { role: UserRole.ADMIN, isActive: true },
      });
      if (activeAdmins <= 1)
        throw new BadRequestException('At least one active admin must remain');
    }

    const data: Prisma.UserUpdateInput = {};
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });

    // A deactivated user must not keep a working session.
    if (dto.isActive === false) {
      await this.prisma.session
        .deleteMany({ where: { userId: id } })
        .catch(() => undefined);
    }

    const { _count, ...rest } = updated;
    return { ...rest, propertiesCount: _count.properties };
  }

  // ─── Site settings ────────────────────────────────────────────────────────

  async getSettings(): Promise<Record<SettingKey, string | null>> {
    const rows = await this.prisma.siteSettings.findMany({
      where: { key: { in: [...SETTING_KEYS] } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      default_contact_phone:
        map.default_contact_phone ?? process.env.DEFAULT_CONTACT_PHONE ?? null,
      listing_moderation: map.listing_moderation ?? 'off',
    };
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const entries = Object.entries(dto).filter(
      ([key, value]) =>
        SETTING_KEYS.includes(key as SettingKey) && value !== undefined,
    );
    await this.prisma.$transaction(
      entries.map(([key, value]) =>
        value === null
          ? this.prisma.siteSettings.deleteMany({ where: { key } })
          : this.prisma.siteSettings.upsert({
              where: { key },
              create: { key, value: String(value) },
              update: { value: String(value) },
            }),
      ),
    );
    return this.getSettings();
  }
}
