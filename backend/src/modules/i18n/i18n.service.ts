import { Injectable, Logger, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  LanguageDirection,
  CreateLanguageDto,
  UpdateLanguageDto,
  CreateTranslationDto,
  BulkTranslationDto,
  ImportTranslationsDto,
  TranslateContentDto,
} from './dto/i18n.dto';

@Injectable()
export class I18nService {
  private readonly logger = new Logger(I18nService.name);
  private translationCache: Map<string, Record<string, any>> = new Map();

  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // LANGUAGE MANAGEMENT
  // ============================================

  /**
   * Get all languages
   */
  async getLanguages(includeInactive = false): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('languages')
      .select('*');

    if (!includeInactive) {
      query = query.where('is_active', true);
    }

    const languages = await query.orderBy('is_default', 'DESC').orderBy('name', 'ASC').get();

    // Get translation progress for each language
    const results = await Promise.all(
      (languages || []).map(async (lang: any) => {
        const progress = await this.getTranslationProgress(lang.code);
        return {
          ...this.transformLanguage(lang),
          translationProgress: progress,
        };
      }),
    );

    return results;
  }

  /**
   * Get language by code
   */
  async getLanguage(code: string): Promise<any> {
    const languages = await /* TODO: replace client call */ this.db.client.query
      .from('languages')
      .select('*')
      .where('code', code.toLowerCase())
      .get();

    if (!languages || languages.length === 0) {
      throw new NotFoundException('Language not found');
    }

    return this.transformLanguage(languages[0]);
  }

  /**
   * Create language
   */
  async createLanguage(dto: CreateLanguageDto): Promise<any> {
    const code = dto.code.toLowerCase();

    // Check if language already exists
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('languages')
      .select('id')
      .where('code', code)
      .get();

    if (existing && existing.length > 0) {
      throw new ConflictException('Language already exists');
    }

    // If setting as default, unset current default
    if (dto.isDefault) {
      await /* TODO: replace client call */ this.db.client.query
        .from('languages')
        .where('is_default', true)
        .update({ is_default: false })
        .execute();
    }

    const result = await /* TODO: replace client call */ this.db.client.query
      .from('languages')
      .insert({
        code,
        name: dto.name,
        native_name: dto.nativeName,
        direction: dto.direction || LanguageDirection.LTR,
        flag: dto.flag || null,
        is_active: dto.isActive !== false,
        is_default: dto.isDefault || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    // Copy default translations to new language
    if (!dto.isDefault) {
      await this.copyDefaultTranslations(code);
    }

    return this.transformLanguage(result[0]);
  }

  /**
   * Update language
   */
  async updateLanguage(code: string, dto: UpdateLanguageDto): Promise<any> {
    await this.getLanguage(code);

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.nativeName !== undefined) updateData.native_name = dto.nativeName;
    if (dto.direction !== undefined) updateData.direction = dto.direction;
    if (dto.flag !== undefined) updateData.flag = dto.flag;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    if (dto.isDefault === true) {
      // Unset current default
      await /* TODO: replace client call */ this.db.client.query
        .from('languages')
        .where('is_default', true)
        .update({ is_default: false })
        .execute();
      updateData.is_default = true;
    }

    await /* TODO: replace client call */ this.db.client.query
      .from('languages')
      .where('code', code.toLowerCase())
      .update(updateData)
      .execute();

    return this.getLanguage(code);
  }

  /**
   * Delete language
   */
  async deleteLanguage(code: string): Promise<void> {
    const language = await this.getLanguage(code);

    if (language.isDefault) {
      throw new BadRequestException('Cannot delete default language');
    }

    // Soft delete - just deactivate
    await /* TODO: replace client call */ this.db.client.query
      .from('languages')
      .where('code', code.toLowerCase())
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Clear cache
    this.clearCacheForLanguage(code);
  }

  /**
   * Get default language
   */
  async getDefaultLanguage(): Promise<any> {
    const languages = await /* TODO: replace client call */ this.db.client.query
      .from('languages')
      .select('*')
      .where('is_default', true)
      .get();

    if (!languages || languages.length === 0) {
      // Return English as fallback
      return {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        direction: LanguageDirection.LTR,
        isDefault: true,
      };
    }

    return this.transformLanguage(languages[0]);
  }

  // ============================================
  // TRANSLATION MANAGEMENT
  // ============================================

  /**
   * Get translations for a language and namespace
   */
  async getTranslations(languageCode: string, namespace?: string): Promise<Record<string, any>> {
    const cacheKey = `${languageCode}:${namespace || 'all'}`;

    // Check cache
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    let query = /* TODO: replace client call */ this.db.client.query
      .from('translations')
      .select('*')
      .where('language_code', languageCode.toLowerCase());

    if (namespace) {
      query = query.where('namespace', namespace);
    }

    const translations = await query.get();

    // Group by namespace
    const result: Record<string, Record<string, string>> = {};
    for (const t of translations || []) {
      if (!result[t.namespace]) {
        result[t.namespace] = {};
      }
      result[t.namespace][t.key] = t.value;
    }

    // Cache result
    this.translationCache.set(cacheKey, result);

    return result;
  }

  /**
   * Get single translation
   */
  async getTranslation(languageCode: string, namespace: string, key: string): Promise<string | null> {
    const translations = await /* TODO: replace client call */ this.db.client.query
      .from('translations')
      .select('value')
      .where('language_code', languageCode.toLowerCase())
      .where('namespace', namespace)
      .where('key', key)
      .get();

    return translations && translations.length > 0 ? translations[0].value : null;
  }

  /**
   * Create or update translation
   */
  async setTranslation(dto: CreateTranslationDto): Promise<any> {
    const languageCode = dto.languageCode.toLowerCase();

    // Check if translation exists
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('translations')
      .select('id')
      .where('language_code', languageCode)
      .where('namespace', dto.namespace)
      .where('key', dto.key)
      .get();

    let result;
    if (existing && existing.length > 0) {
      // Update
      await /* TODO: replace client call */ this.db.client.query
        .from('translations')
        .where('id', existing[0].id)
        .update({
          value: dto.value,
          updated_at: new Date().toISOString(),
        })
        .execute();
      result = { id: existing[0].id, ...dto };
    } else {
      // Create
      const inserted = await /* TODO: replace client call */ this.db.client.query
        .from('translations')
        .insert({
          language_code: languageCode,
          namespace: dto.namespace,
          key: dto.key,
          value: dto.value,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .returning('*')
        .execute();
      result = this.transformTranslation(inserted[0]);
    }

    // Clear cache
    this.clearCacheForLanguage(languageCode);

    return result;
  }

  /**
   * Bulk update translations
   */
  async bulkSetTranslations(dto: BulkTranslationDto): Promise<{ updated: number; created: number }> {
    const languageCode = dto.languageCode.toLowerCase();
    let updated = 0;
    let created = 0;

    for (const [key, value] of Object.entries(dto.translations)) {
      const existing = await /* TODO: replace client call */ this.db.client.query
        .from('translations')
        .select('id')
        .where('language_code', languageCode)
        .where('namespace', dto.namespace)
        .where('key', key)
        .get();

      if (existing && existing.length > 0) {
        await /* TODO: replace client call */ this.db.client.query
          .from('translations')
          .where('id', existing[0].id)
          .update({
            value,
            updated_at: new Date().toISOString(),
          })
          .execute();
        updated++;
      } else {
        await /* TODO: replace client call */ this.db.client.query
          .from('translations')
          .insert({
            language_code: languageCode,
            namespace: dto.namespace,
            key,
            value,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .execute();
        created++;
      }
    }

    this.clearCacheForLanguage(languageCode);

    return { updated, created };
  }

  /**
   * Import translations from JSON
   */
  async importTranslations(dto: ImportTranslationsDto): Promise<{ namespaces: number; keys: number }> {
    const languageCode = dto.languageCode.toLowerCase();
    let totalKeys = 0;

    for (const [namespace, translations] of Object.entries(dto.data)) {
      for (const [key, value] of Object.entries(translations)) {
        if (dto.overwrite) {
          await this.setTranslation({
            languageCode,
            namespace,
            key,
            value,
          });
        } else {
          // Only create if not exists
          const existing = await this.getTranslation(languageCode, namespace, key);
          if (!existing) {
            await this.setTranslation({
              languageCode,
              namespace,
              key,
              value,
            });
          }
        }
        totalKeys++;
      }
    }

    this.clearCacheForLanguage(languageCode);

    return {
      namespaces: Object.keys(dto.data).length,
      keys: totalKeys,
    };
  }

  /**
   * Export translations for a language
   */
  async exportTranslations(languageCode: string): Promise<any> {
    const language = await this.getLanguage(languageCode);
    const translations = await this.getTranslations(languageCode);

    return {
      language,
      translations,
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Delete translation
   */
  async deleteTranslation(languageCode: string, namespace: string, key: string): Promise<void> {
    await /* TODO: replace client call */ this.db.client.query
      .from('translations')
      .where('language_code', languageCode.toLowerCase())
      .where('namespace', namespace)
      .where('key', key)
      .delete()
      .execute();

    this.clearCacheForLanguage(languageCode);
  }

  // ============================================
  // CONTENT TRANSLATIONS
  // ============================================

  /**
   * Set content translation (for products, categories, etc.)
   */
  async setContentTranslation(dto: TranslateContentDto): Promise<any> {
    const languageCode = dto.languageCode.toLowerCase();

    // Check if translation exists
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('content_translations')
      .select('id')
      .where('entity_type', dto.entityType)
      .where('entity_id', dto.entityId)
      .where('language_code', languageCode)
      .get();

    if (existing && existing.length > 0) {
      // Update
      await /* TODO: replace client call */ this.db.client.query
        .from('content_translations')
        .where('id', existing[0].id)
        .update({
          fields: JSON.stringify(dto.fields),
          updated_at: new Date().toISOString(),
        })
        .execute();
    } else {
      // Create
      await /* TODO: replace client call */ this.db.client.query
        .from('content_translations')
        .insert({
          entity_type: dto.entityType,
          entity_id: dto.entityId,
          language_code: languageCode,
          fields: JSON.stringify(dto.fields),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .execute();
    }

    return this.getContentTranslation(dto.entityType, dto.entityId, languageCode);
  }

  /**
   * Get content translation
   */
  async getContentTranslation(entityType: string, entityId: string, languageCode?: string): Promise<any> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('content_translations')
      .select('*')
      .where('entity_type', entityType)
      .where('entity_id', entityId);

    if (languageCode) {
      query = query.where('language_code', languageCode.toLowerCase());
    }

    const translations = await query.get();

    if (languageCode) {
      if (!translations || translations.length === 0) {
        return null;
      }
      return this.transformContentTranslation(translations[0]);
    }

    // Return all translations for entity
    return (translations || []).map(this.transformContentTranslation);
  }

  /**
   * Delete content translation
   */
  async deleteContentTranslation(entityType: string, entityId: string, languageCode?: string): Promise<void> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('content_translations')
      .where('entity_type', entityType)
      .where('entity_id', entityId);

    if (languageCode) {
      query = query.where('language_code', languageCode.toLowerCase());
    }

    await query.delete().execute();
  }

  // ============================================
  // NAMESPACES
  // ============================================

  /**
   * Get all namespaces
   */
  async getNamespaces(): Promise<string[]> {
    const result = await /* TODO: replace client call */ this.db.client.query
      .from('translations')
      .select('namespace')
      .groupBy('namespace')
      .get();

    return (result || []).map((r: any) => r.namespace);
  }

  /**
   * Get missing translations for a language
   */
  async getMissingTranslations(languageCode: string): Promise<any[]> {
    const defaultLang = await this.getDefaultLanguage();

    if (defaultLang.code === languageCode.toLowerCase()) {
      return [];
    }

    // Get all default language translations
    const defaultTranslations = await /* TODO: replace client call */ this.db.client.query
      .from('translations')
      .select('namespace', 'key')
      .where('language_code', defaultLang.code)
      .get();

    // Get target language translations
    const targetTranslations = await /* TODO: replace client call */ this.db.client.query
      .from('translations')
      .select('namespace', 'key')
      .where('language_code', languageCode.toLowerCase())
      .get();

    const targetKeys = new Set(
      (targetTranslations || []).map((t: any) => `${t.namespace}:${t.key}`),
    );

    // Find missing
    return (defaultTranslations || [])
      .filter((t: any) => !targetKeys.has(`${t.namespace}:${t.key}`))
      .map((t: any) => ({
        namespace: t.namespace,
        key: t.key,
      }));
  }

  // ============================================
  // HELPERS
  // ============================================

  private async getTranslationProgress(languageCode: string): Promise<number> {
    const defaultLang = await this.getDefaultLanguage();

    if (defaultLang.code === languageCode.toLowerCase()) {
      return 100;
    }

    const defaultCount = await /* TODO: replace client call */ this.db.client.query
      .from('translations')
      .select('id')
      .where('language_code', defaultLang.code)
      .get();

    const targetCount = await /* TODO: replace client call */ this.db.client.query
      .from('translations')
      .select('id')
      .where('language_code', languageCode.toLowerCase())
      .get();

    const total = (defaultCount || []).length;
    const translated = (targetCount || []).length;

    if (total === 0) return 100;
    return Math.round((translated / total) * 100);
  }

  private async copyDefaultTranslations(targetLanguageCode: string): Promise<void> {
    const defaultLang = await this.getDefaultLanguage();
    const translations = await this.getTranslations(defaultLang.code);

    for (const [namespace, keys] of Object.entries(translations)) {
      for (const [key, value] of Object.entries(keys as Record<string, string>)) {
        await /* TODO: replace client call */ this.db.client.query
          .from('translations')
          .insert({
            language_code: targetLanguageCode.toLowerCase(),
            namespace,
            key,
            value, // Keep original value as placeholder
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .execute();
      }
    }
  }

  private clearCacheForLanguage(languageCode: string): void {
    for (const key of this.translationCache.keys()) {
      if (key.startsWith(`${languageCode.toLowerCase()}:`)) {
        this.translationCache.delete(key);
      }
    }
  }

  private transformLanguage(lang: any): any {
    return {
      id: lang.id,
      code: lang.code,
      name: lang.name,
      nativeName: lang.native_name,
      direction: lang.direction,
      flag: lang.flag,
      isActive: lang.is_active,
      isDefault: lang.is_default,
      createdAt: lang.created_at,
      updatedAt: lang.updated_at,
    };
  }

  private transformTranslation(t: any): any {
    return {
      id: t.id,
      languageCode: t.language_code,
      namespace: t.namespace,
      key: t.key,
      value: t.value,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    };
  }

  private transformContentTranslation(t: any): any {
    return {
      id: t.id,
      entityType: t.entity_type,
      entityId: t.entity_id,
      languageCode: t.language_code,
      fields: typeof t.fields === 'string' ? JSON.parse(t.fields) : t.fields,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    };
  }
}
