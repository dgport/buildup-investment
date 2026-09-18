/* Explicit demo-content transfer. Never exports users, sessions, leads or credentials. */
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ quiet: true });
const prisma = new PrismaClient();
const [mode, filename] = process.argv.slice(2);
const strip = (value, keys) => Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
const child = (value) => strip(value, ['id', 'propertyId', 'projectId', 'developerId', 'unitTypeId', 'createdAt', 'updatedAt']);

async function main() {
  if (!filename || !['export', 'import'].includes(mode)) throw new Error('Usage: node scripts/transfer-demo-data.cjs export|import FILE');
  if (mode === 'export') {
    const [developers, projects, properties] = await Promise.all([
      prisma.developer.findMany({ include: { translations: true } }),
      prisma.project.findMany({ include: { translations: true, images: true, unitTypes: { include: { translations: true } } } }),
      prisma.property.findMany({ include: { translations: true, galleryImages: true } }),
    ]);
    const mediaRoot = path.join(path.dirname(path.resolve(filename)), 'demo-assets', 'uploads', 'demo');
    const uploads = path.resolve('public/uploads');
    const copyImage = (url) => {
      if (!url) return url;
      const pathname = url.startsWith('http') ? new URL(url).pathname : '/' + url.replace(/^\/+/, '');
      if (!pathname.startsWith('/uploads/')) throw new Error(`Unsupported demo asset: ${pathname}`);
      const relative = decodeURIComponent(pathname.slice('/uploads/'.length));
      const source = path.resolve(uploads, relative);
      if (!source.startsWith(uploads + path.sep)) throw new Error('Unsafe asset path');
      const destination = path.join(mediaRoot, relative);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(source, destination);
      const ext = path.extname(source);
      const thumb = source.slice(0, -ext.length) + '_t' + ext;
      if (fs.existsSync(thumb)) fs.copyFileSync(thumb, destination.slice(0, -ext.length) + '_t' + ext);
      return '/uploads/demo/' + relative.replaceAll('\\', '/');
    };
    for (const d of developers) { d.logo = copyImage(d.logo); d.phone = null; d.email = null; }
    for (const p of projects) for (const image of p.images) image.imageUrl = copyImage(image.imageUrl);
    for (const p of properties) {
      delete p.userId;
      p.contactPhone = null;
      p.rejectionReason = null;
      for (const image of p.galleryImages) image.imageUrl = copyImage(image.imageUrl);
      for (const t of p.translations) {
        if (!t.title?.trim() || /^\d+$/.test(t.title.trim())) {
          t.title = t.language === 'ka' ? `უძრავი ქონების მაგალითი #${p.externalId}` : t.language === 'ru' ? `Пример недвижимости #${p.externalId}` : `Property example #${p.externalId}`;
        }
      }
    }
    fs.mkdirSync(path.dirname(path.resolve(filename)), { recursive: true });
    fs.writeFileSync(filename, JSON.stringify({ version: 1, developers, projects, properties }, null, 2));
    console.log(JSON.stringify({ exported: { developers: developers.length, projects: projects.length, properties: properties.length }, mediaRoot }));
    return;
  }
  if (process.env.DEMO_IMPORT_CONFIRM !== 'buildup-investment') throw new Error('Set DEMO_IMPORT_CONFIRM=buildup-investment for an explicit import');
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  if (data.version !== 1) throw new Error('Unsupported export format');
  const result = await prisma.$transaction(async (db) => {
    const developerIds = new Map();
    const counts = { developers: 0, projects: 0, properties: 0 };
    for (const d of data.developers) {
      const existing = await db.developer.findUnique({ where: { slug: d.slug } });
      if (existing) { developerIds.set(d.id, existing.id); continue; }
      const created = await db.developer.create({ data: { ...strip(d, ['translations', 'createdAt', 'updatedAt']), isDemo: true, translations: { create: d.translations.map(child) } } });
      developerIds.set(d.id, created.id); counts.developers++;
    }
    for (const p of data.projects) {
      const existing = await db.project.findFirst({ where: { OR: [{ id: p.id }, { slug: p.slug }] } });
      if (existing) { if (!existing.isDemo) throw new Error(`Refusing to replace live project ${p.slug}`); continue; }
      await db.project.create({ data: {
        ...strip(p, ['translations', 'images', 'unitTypes', 'createdAt', 'updatedAt']),
        isDemo: true, developerId: developerIds.get(p.developerId),
        translations: { create: p.translations.map(child) },
        unitTypes: { create: p.unitTypes.map((u) => ({ ...strip(u, ['projectId', 'translations', 'createdAt', 'updatedAt']), translations: { create: u.translations.map(child) } })) },
      } });
      for (const image of p.images) await db.projectImage.create({ data: { ...child(image), projectId: p.id, unitTypeId: image.unitTypeId } });
      counts.projects++;
    }
    const owner = await db.user.findFirst({ where: { role: 'ADMIN', isActive: true }, select: { id: true } });
    for (const p of data.properties) {
      const existing = await db.property.findFirst({ where: { OR: [{ id: p.id }, { externalId: p.externalId }] } });
      if (existing) { if (!existing.isDemo) throw new Error(`Refusing to replace live property ${p.externalId}`); continue; }
      await db.property.create({ data: {
        ...strip(p, ['translations', 'galleryImages', 'createdAt', 'updatedAt', 'userId']),
        isDemo: true, userId: owner?.id ?? null,
        translations: { create: p.translations.map(child) },
        galleryImages: { create: p.galleryImages.map(child) },
      } });
      counts.properties++;
    }
    return counts;
  }, { timeout: 30000 });
  console.log(JSON.stringify({ imported: result }));
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
