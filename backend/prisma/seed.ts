import { PrismaClient, Region } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRegionTranslations(): Promise<void> {
  const translations: { region: Region; language: string; name: string }[] = [
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

  console.log(`✅ Seeded ${translations.length} region translations`);
}

/**
 * Site-wide fallback phone shown on listings whose owner has no phone.
 * Set DEFAULT_CONTACT_PHONE in .env to override (re-run the seed to apply).
 */
async function seedSiteSettings(): Promise<void> {
  const phone = process.env.DEFAULT_CONTACT_PHONE;
  if (!phone) return;

  await prisma.siteSettings.upsert({
    where: { key: 'default_contact_phone' },
    update: { value: phone },
    create: {
      key: 'default_contact_phone',
      value: phone,
      description: 'Fallback contact phone for listings without one',
    },
  });
  console.log('✅ Seeded default_contact_phone');
}

async function main(): Promise<void> {
  await seedRegionTranslations();
  await seedSiteSettings();
}

main()
  .then(() => console.log('✅ Seed completed'))
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
