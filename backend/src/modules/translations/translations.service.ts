import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AIService } from '../ai/ai.service';
import { TranslatedFieldsDto } from './dto/translations.dto';

@Injectable()
export class TranslationsService {
  private readonly logger = new Logger(TranslationsService.name);
  private readonly TABLE = 'entity_translations';

  constructor(
    private readonly db: DatabaseService,
    private readonly aiService: AIService,
  ) {}

  /**
   * Set (upsert) a translation for a given entity + locale.
   */
  async setTranslation(
    entityType: string,
    entityId: string,
    locale: string,
    fields: TranslatedFieldsDto,
    isAutoTranslated = false,
  ) {
    const existing = await this.db.findOne(this.TABLE, {
      entity_type: entityType,
      entity_id: entityId,
      locale,
    });

    if (existing) {
      const merged = { ...existing.translated_fields, ...fields };
      const updated = await this.db.update(this.TABLE, existing.id, {
        translated_fields: JSON.stringify(merged),
        is_auto_translated: isAutoTranslated,
        updated_at: new Date().toISOString(),
      });
      return updated;
    }

    const row = await this.db.insert(this.TABLE, {
      entity_type: entityType,
      entity_id: entityId,
      locale,
      translated_fields: JSON.stringify(fields),
      is_auto_translated: isAutoTranslated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return row;
  }

  /**
   * Get translation for a specific locale.
   */
  async getTranslation(entityType: string, entityId: string, locale: string) {
    const row = await this.db.findOne(this.TABLE, {
      entity_type: entityType,
      entity_id: entityId,
      locale,
    });
    if (!row) {
      throw new NotFoundException(
        `No translation found for ${entityType}/${entityId} in locale "${locale}"`,
      );
    }
    return row;
  }

  /**
   * Get all translations for an entity.
   */
  async getTranslations(entityType: string, entityId: string) {
    const rows = await this.db.findMany(this.TABLE, {
      entity_type: entityType,
      entity_id: entityId,
    });
    return rows;
  }

  /**
   * Delete a translation for a specific locale.
   */
  async deleteTranslation(entityType: string, entityId: string, locale: string) {
    const existing = await this.db.findOne(this.TABLE, {
      entity_type: entityType,
      entity_id: entityId,
      locale,
    });
    if (!existing) {
      throw new NotFoundException(
        `No translation found for ${entityType}/${entityId} in locale "${locale}"`,
      );
    }
    await this.db.delete(this.TABLE, existing.id);
    return { message: 'Translation deleted successfully' };
  }

  /**
   * Use the AI module to auto-translate from the source locale (or original entity fields).
   */
  async autoTranslate(
    entityType: string,
    entityId: string,
    targetLocale: string,
    sourceLocale?: string,
    shopId?: string,
  ) {
    // Determine source content: try sourceLocale translation first, then fall back to original entity.
    let sourceName = '';
    let sourceDescription = '';
    let sourceShortDescription = '';
    let sourceMetaTitle = '';
    let sourceMetaDescription = '';

    if (sourceLocale) {
      const srcTranslation = await this.db.findOne(this.TABLE, {
        entity_type: entityType,
        entity_id: entityId,
        locale: sourceLocale,
      });
      if (srcTranslation?.translated_fields) {
        const f = srcTranslation.translated_fields;
        sourceName = f.name || '';
        sourceDescription = f.description || '';
        sourceShortDescription = f.short_description || '';
        sourceMetaTitle = f.meta_title || '';
        sourceMetaDescription = f.meta_description || '';
      }
    }

    // Fall back to the original entity if no source translation
    if (!sourceName) {
      const tableName = entityType === 'product' ? 'products' : 'categories';
      const entity = await this.db.findOne(tableName, { id: entityId });
      if (!entity) {
        throw new NotFoundException(`${entityType} with id "${entityId}" not found`);
      }
      sourceName = entity.name || '';
      sourceDescription = entity.description || '';
      sourceShortDescription = entity.short_description || '';
      sourceMetaTitle = entity.meta_title || '';
      sourceMetaDescription = entity.meta_description || '';
    }

    if (!sourceName && !sourceDescription) {
      throw new BadRequestException('No source content found to translate');
    }

    // Build the prompt content for the AI service
    const contentParts: string[] = [];
    if (sourceName) contentParts.push(`Name: ${sourceName}`);
    if (sourceDescription) contentParts.push(`Description: ${sourceDescription}`);
    if (sourceShortDescription) contentParts.push(`Short Description: ${sourceShortDescription}`);
    if (sourceMetaTitle) contentParts.push(`Meta Title: ${sourceMetaTitle}`);
    if (sourceMetaDescription) contentParts.push(`Meta Description: ${sourceMetaDescription}`);

    // Use the AI service translateProduct method
    const aiResult = await this.aiService.translateProduct(shopId || 'system', {
      productName: sourceName,
      description: sourceDescription,
      sourceLanguage: sourceLocale || 'en',
      targetLanguage: targetLocale,
      features: [],
      includeSeo: !!(sourceMetaTitle || sourceMetaDescription),
    });

    const translated = aiResult.data || {};
    const fields: TranslatedFieldsDto = {
      name: translated.name || undefined,
      description: translated.description || undefined,
      short_description: sourceShortDescription ? (translated.shortDescription || undefined) : undefined,
      meta_title: translated.seo?.metaTitle || undefined,
      meta_description: translated.seo?.metaDescription || undefined,
    };

    return this.setTranslation(entityType, entityId, targetLocale, fields, true);
  }

  /**
   * Overlay translated fields onto an entity object.
   * Used by the middleware / interceptor when Accept-Language is set.
   */
  overlayTranslation(entity: any, translatedFields: Record<string, any>): any {
    const result = { ...entity };
    for (const [key, value] of Object.entries(translatedFields)) {
      if (value !== null && value !== undefined && value !== '') {
        result[key] = value;
      }
    }
    return result;
  }
}
