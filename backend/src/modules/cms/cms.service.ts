import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

// Entity types for CMS tables
const SITE_PAGES_TABLE = 'site_pages';
const SITE_SETTINGS_TABLE = 'site_settings';

export interface SitePage {
  id: string;
  slug: string;
  title: string;
  content: Record<string, any>;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  template: string;
  headerImage?: string;
  showBreadcrumb: boolean;
  showTableOfContents: boolean;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  publishScheduledAt?: string;
  version: number;
  lastEditedBy?: string;
  isPublic: boolean;
  requiresAuth: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  group: string;
  value: any;
  valueType: string;
  label?: string;
  description?: string;
  isPublic: boolean;
  lastUpdatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageDto {
  slug: string;
  title: string;
  content: Record<string, any>;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  template?: string;
  headerImage?: string;
  showBreadcrumb?: boolean;
  showTableOfContents?: boolean;
  status?: string;
  isPublic?: boolean;
  requiresAuth?: boolean;
}

export interface UpdatePageDto extends Partial<CreatePageDto> {}

@Injectable()
export class CmsService {
  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // SITE PAGES
  // ============================================

  /**
   * Get all pages (admin only)
   */
  async findAllPages(includeArchived: boolean = false): Promise<{ data: SitePage[]; total: number }> {
    const filters: any = {};

    if (!includeArchived) {
      filters.status = { $ne: 'archived' };
    }

    const result = await this.db.getClient().query
      .from(SITE_PAGES_TABLE)
      .select('*')
      .where('deleted_at', null)
      .orderBy('updated_at', 'DESC')
      .get();

    return {
      data: this.transformPages(result || []),
      total: (result || []).length,
    };
  }

  /**
   * Get published page by slug (public)
   */
  async findPageBySlug(slug: string): Promise<SitePage | null> {
    const result = await this.db.getClient().query
      .from(SITE_PAGES_TABLE)
      .select('*')
      .where('slug', slug)
      .where('status', 'published')
      .where('deleted_at', null)
      .get();

    if (!result || result.length === 0) {
      return null;
    }

    return this.transformPage(result[0]);
  }

  /**
   * Get page by ID (admin)
   */
  async findPageById(id: string): Promise<SitePage> {
    const result = await this.db.getClient().query
      .from(SITE_PAGES_TABLE)
      .select('*')
      .where('id', id)
      .where('deleted_at', null)
      .get();

    if (!result || result.length === 0) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    return this.transformPage(result[0]);
  }

  /**
   * Create a new page
   */
  async createPage(dto: CreatePageDto, userId?: string): Promise<SitePage> {
    // Check if slug already exists
    const existing = await this.db.getClient().query
      .from(SITE_PAGES_TABLE)
      .select('id')
      .where('slug', dto.slug)
      .where('deleted_at', null)
      .get();

    if (existing && existing.length > 0) {
      throw new BadRequestException(`Page with slug "${dto.slug}" already exists`);
    }

    const pageData = {
      slug: dto.slug,
      title: dto.title,
      content: JSON.stringify(dto.content || {}),
      meta_title: dto.metaTitle || dto.title,
      meta_description: dto.metaDescription || '',
      meta_keywords: dto.metaKeywords || '',
      template: dto.template || 'default',
      header_image: dto.headerImage || null,
      show_breadcrumb: dto.showBreadcrumb !== false,
      show_table_of_contents: dto.showTableOfContents || false,
      status: dto.status || 'draft',
      published_at: dto.status === 'published' ? new Date().toISOString() : null,
      version: 1,
      last_edited_by: userId || null,
      is_public: dto.isPublic !== false,
      requires_auth: dto.requiresAuth || false,
    };

    const result = await this.db.getClient().query
      .from(SITE_PAGES_TABLE)
      .insert(pageData)
      .returning('*')
      .execute();

    return this.transformPage(result[0]);
  }

  /**
   * Update a page
   */
  async updatePage(id: string, dto: UpdatePageDto, userId?: string): Promise<SitePage> {
    const existingPage = await this.findPageById(id);

    // Check slug uniqueness if changing
    if (dto.slug && dto.slug !== existingPage.slug) {
      const slugExists = await this.db.getClient().query
        .from(SITE_PAGES_TABLE)
        .select('id')
        .where('slug', dto.slug)
        .where('id', '!=', id)
        .where('deleted_at', null)
        .get();

      if (slugExists && slugExists.length > 0) {
        throw new BadRequestException(`Page with slug "${dto.slug}" already exists`);
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
      version: existingPage.version + 1,
      last_edited_by: userId || existingPage.lastEditedBy,
    };

    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = JSON.stringify(dto.content);
    if (dto.metaTitle !== undefined) updateData.meta_title = dto.metaTitle;
    if (dto.metaDescription !== undefined) updateData.meta_description = dto.metaDescription;
    if (dto.metaKeywords !== undefined) updateData.meta_keywords = dto.metaKeywords;
    if (dto.template !== undefined) updateData.template = dto.template;
    if (dto.headerImage !== undefined) updateData.header_image = dto.headerImage;
    if (dto.showBreadcrumb !== undefined) updateData.show_breadcrumb = dto.showBreadcrumb;
    if (dto.showTableOfContents !== undefined) updateData.show_table_of_contents = dto.showTableOfContents;
    if (dto.isPublic !== undefined) updateData.is_public = dto.isPublic;
    if (dto.requiresAuth !== undefined) updateData.requires_auth = dto.requiresAuth;

    // Handle status change
    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (dto.status === 'published' && existingPage.status !== 'published') {
        updateData.published_at = new Date().toISOString();
      }
    }

    const result = await this.db.getClient().query
      .from(SITE_PAGES_TABLE)
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute();

    return this.transformPage(result[0]);
  }

  /**
   * Delete a page (soft delete)
   */
  async deletePage(id: string): Promise<void> {
    await this.findPageById(id); // Verify exists

    await this.db.getClient().query
      .from(SITE_PAGES_TABLE)
      .where('id', id)
      .update({
        deleted_at: new Date().toISOString(),
        status: 'archived',
      })
      .execute();
  }

  // ============================================
  // SITE SETTINGS
  // ============================================

  /**
   * Get all settings (admin only)
   */
  async findAllSettings(): Promise<{ data: SiteSetting[] }> {
    const result = await this.db.getClient().query
      .from(SITE_SETTINGS_TABLE)
      .select('*')
      .orderBy('setting_group', 'ASC')
      .get();

    return {
      data: this.transformSettings(result || []),
    };
  }

  /**
   * Get public settings (for frontend)
   */
  async findPublicSettings(): Promise<{ data: Record<string, any> }> {
    const result = await this.db.getClient().query
      .from(SITE_SETTINGS_TABLE)
      .select('*')
      .where('is_public', true)
      .get();

    // Transform to key-value object
    const settings: Record<string, any> = {};
    (result || []).forEach((setting: any) => {
      settings[setting.key] = this.parseSettingValue(setting.value, setting.value_type);
    });

    return { data: settings };
  }

  /**
   * Get setting by key
   */
  async findSettingByKey(key: string): Promise<SiteSetting | null> {
    const result = await this.db.getClient().query
      .from(SITE_SETTINGS_TABLE)
      .select('*')
      .where('key', key)
      .get();

    if (!result || result.length === 0) {
      return null;
    }

    return this.transformSetting(result[0]);
  }

  /**
   * Update or create a setting
   */
  async upsertSetting(
    key: string,
    value: any,
    options?: {
      group?: string;
      valueType?: string;
      label?: string;
      description?: string;
      isPublic?: boolean;
    },
    userId?: string,
  ): Promise<SiteSetting> {
    const existing = await this.findSettingByKey(key);

    const settingData = {
      key,
      value: JSON.stringify(value),
      value_type: options?.valueType || (typeof value === 'object' ? 'json' : typeof value),
      setting_group: options?.group || 'general',
      label: options?.label || key,
      description: options?.description || null,
      is_public: options?.isPublic || false,
      last_updated_by: userId || null,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (existing) {
      result = await this.db.getClient().query
        .from(SITE_SETTINGS_TABLE)
        .where('key', key)
        .update(settingData)
        .returning('*')
        .execute();
    } else {
      result = await this.db.getClient().query
        .from(SITE_SETTINGS_TABLE)
        .insert(settingData)
        .returning('*')
        .execute();
    }

    return this.transformSetting(result[0]);
  }

  /**
   * Delete a setting
   */
  async deleteSetting(key: string): Promise<void> {
    await this.db.getClient().query
      .from(SITE_SETTINGS_TABLE)
      .where('key', key)
      .delete()
      .execute();
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private transformPages(pages: any[]): SitePage[] {
    return pages.map((page) => this.transformPage(page));
  }

  private transformPage(page: any): SitePage {
    return {
      id: page.id,
      slug: page.slug,
      title: page.title,
      content: typeof page.content === 'string' ? JSON.parse(page.content) : page.content,
      metaTitle: page.meta_title,
      metaDescription: page.meta_description,
      metaKeywords: page.meta_keywords,
      template: page.template,
      headerImage: page.header_image,
      showBreadcrumb: page.show_breadcrumb,
      showTableOfContents: page.show_table_of_contents,
      status: page.status,
      publishedAt: page.published_at,
      publishScheduledAt: page.publish_scheduled_at,
      version: page.version,
      lastEditedBy: page.last_edited_by,
      isPublic: page.is_public,
      requiresAuth: page.requires_auth,
      createdAt: page.created_at,
      updatedAt: page.updated_at,
    };
  }

  private transformSettings(settings: any[]): SiteSetting[] {
    return settings.map((setting) => this.transformSetting(setting));
  }

  private transformSetting(setting: any): SiteSetting {
    return {
      id: setting.id,
      key: setting.key,
      group: setting.setting_group,
      value: this.parseSettingValue(setting.value, setting.value_type),
      valueType: setting.value_type,
      label: setting.label,
      description: setting.description,
      isPublic: setting.is_public,
      lastUpdatedBy: setting.last_updated_by,
      createdAt: setting.created_at,
      updatedAt: setting.updated_at,
    };
  }

  private parseSettingValue(value: any, valueType: string): any {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (valueType === 'boolean') return Boolean(parsed);
        if (valueType === 'number') return Number(parsed);
        return parsed;
      } catch {
        return value;
      }
    }
    return value;
  }
}
