import { PrismaService } from '@/prisma/prisma.service';
import { LANGUAGES } from '@/common/constants/language';

interface TranslationSyncConfig {
  entityId: number;
  entityIdField: string;
  translationModel: any;
  existingTranslations: Array<{ language: string }>;
  defaultFields?: Record<string, any>;
}

export class TranslationSyncUtil {
  /**
   * Ensures all languages from LANGUAGES constant have translations for an entity.
   * Creates missing translations with empty/default values.
   *
   * @param prisma - PrismaService instance
   * @param config - Configuration object
   * @returns Array of missing languages that were created
   */
  static async syncMissingTranslations(
    prisma: PrismaService,
    config: TranslationSyncConfig,
  ): Promise<string[]> {
    const {
      entityId,
      entityIdField,
      translationModel,
      existingTranslations,
      defaultFields = {},
    } = config;

    const existingLanguages = existingTranslations.map((t) => t.language);
    const missingLanguages = LANGUAGES.filter(
      (lang) => !existingLanguages.includes(lang),
    );

    if (missingLanguages.length > 0) {
      await translationModel.createMany({
        data: missingLanguages.map((lang) => ({
          [entityIdField]: entityId,
          language: lang,
          ...defaultFields,
        })),
        skipDuplicates: true,
      });
    }

    return missingLanguages;
  }

  /**
   * Syncs translations for multiple entities at once.
   * Useful for batch operations or admin utilities.
   *
   * @param prisma - PrismaService instance
   * @param entityModel - Prisma model for the main entity
   * @param entityIdField - Field name for entity ID in translations table
   * @param translationModel - Prisma model for translations
   * @param defaultFields - Default fields for new translations
   * @returns Object with sync statistics
   */
  static async syncAllEntities(
    prisma: PrismaService,
    entityModel: any,
    entityIdField: string,
    translationModel: any,
    defaultFields: (entityId: number) => Record<string, any> = () => ({}),
  ): Promise<{ totalEntities: number; totalCreated: number }> {
    const entities = await entityModel.findMany({
      include: { translations: true },
    });

    let totalCreated = 0;

    for (const entity of entities) {
      const missingLanguages = await this.syncMissingTranslations(prisma, {
        entityId: entity.id,
        entityIdField,
        translationModel,
        existingTranslations: entity.translations,
        defaultFields: defaultFields(entity.id),
      });

      totalCreated += missingLanguages.length;
    }

    return {
      totalEntities: entities.length,
      totalCreated,
    };
  }
}
