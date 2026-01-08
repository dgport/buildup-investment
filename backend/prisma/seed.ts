import { PrismaClient, Region } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRegionTranslations() {
  const translations = [
    { region: Region.BATUMI, language: 'en', name: 'Batumi' },
    { region: Region.BATUMI, language: 'ka', name: 'ბათუმი' },
    { region: Region.BATUMI, language: 'ru', name: 'Батуми' },

    { region: Region.KOBULETI, language: 'en', name: 'Kobuleti' },
    { region: Region.KOBULETI, language: 'ka', name: 'ქობულეთი' },
    { region: Region.KOBULETI, language: 'ru', name: 'Кобулети' },

    { region: Region.CHAKVI, language: 'en', name: 'Chakvi' },
    { region: Region.CHAKVI, language: 'ka', name: 'ჩაქვი' },
    { region: Region.CHAKVI, language: 'ru', name: 'Чакви' },

    { region: Region.MAKHINJAURI, language: 'en', name: 'Makhinjauri' },
    { region: Region.MAKHINJAURI, language: 'ka', name: 'მახინჯაური' },
    { region: Region.MAKHINJAURI, language: 'ru', name: 'Махинджаури' },

    { region: Region.GONIO, language: 'en', name: 'Gonio' },
    { region: Region.GONIO, language: 'ka', name: 'გონიო' },
    { region: Region.GONIO, language: 'ru', name: 'Гонио' },

    { region: Region.UREKI, language: 'en', name: 'Ureki' },
    { region: Region.UREKI, language: 'ka', name: 'ურეკი' },
    { region: Region.UREKI, language: 'ru', name: 'Уреки' },
  ];

  for (const translation of translations) {
    await prisma.regionTranslations.upsert({
      where: {
        region_language: {
          region: translation.region,
          language: translation.language,
        },
      },
      update: { name: translation.name },
      create: translation,
    });
  }
}

async function main() {
  await seedRegionTranslations();
}

main()
  .then(() => console.log('✅ Regions seeded'))
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
