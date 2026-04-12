import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

@Injectable()
export class SitemapService {
  private readonly logger = new Logger(SitemapService.name);
  private cachedSitemap: string | null = null;
  private cachedAt: Date | null = null;

  /** Cache lifetime in milliseconds (1 hour) */
  private readonly CACHE_TTL = 60 * 60 * 1000;
  /** Google's max URLs per sitemap file */
  private readonly MAX_URLS_PER_SITEMAP = 50_000;

  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  private getFrontendUrl(): string {
    return (
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('APP_URL') ||
      'https://localhost:3000'
    );
  }

  /**
   * Return cached sitemap XML or rebuild if stale / missing.
   */
  async getSitemap(): Promise<string> {
    if (this.cachedSitemap && this.cachedAt) {
      const age = Date.now() - this.cachedAt.getTime();
      if (age < this.CACHE_TTL) {
        return this.cachedSitemap;
      }
    }
    return this.rebuild();
  }

  /**
   * Force-rebuild the sitemap cache and return the XML.
   */
  async rebuild(): Promise<string> {
    this.logger.log('Rebuilding sitemap...');
    const entries = await this.collectEntries();

    let xml: string;
    if (entries.length > this.MAX_URLS_PER_SITEMAP) {
      xml = this.buildSitemapIndex(entries);
    } else {
      xml = this.buildSitemapXml(entries);
    }

    this.cachedSitemap = xml;
    this.cachedAt = new Date();
    this.logger.log(`Sitemap rebuilt with ${entries.length} URLs`);
    return xml;
  }

  // ------------------------------------------------------------------
  // Data collection
  // ------------------------------------------------------------------

  private async collectEntries(): Promise<SitemapEntry[]> {
    const baseUrl = this.getFrontendUrl();
    const entries: SitemapEntry[] = [];

    const [products, categories, blogPosts, pages] = await Promise.all([
      this.fetchProducts(),
      this.fetchCategories(),
      this.fetchBlogPosts(),
      this.fetchPages(),
    ]);

    for (const p of products) {
      entries.push({
        loc: `${baseUrl}/products/${p.slug}`,
        lastmod: this.toW3CDate(p.updated_at || p.created_at),
        changefreq: 'weekly',
        priority: '0.8',
      });
    }

    for (const c of categories) {
      entries.push({
        loc: `${baseUrl}/categories/${c.slug}`,
        lastmod: this.toW3CDate(c.updated_at || c.created_at),
        changefreq: 'weekly',
        priority: '0.9',
      });
    }

    for (const bp of blogPosts) {
      entries.push({
        loc: `${baseUrl}/blog/${bp.slug}`,
        lastmod: this.toW3CDate(bp.updated_at || bp.published_at || bp.created_at),
        changefreq: 'monthly',
        priority: '0.6',
      });
    }

    for (const page of pages) {
      entries.push({
        loc: `${baseUrl}/${page.slug}`,
        lastmod: this.toW3CDate(page.updated_at || page.published_at || page.created_at),
        changefreq: 'monthly',
        priority: '0.5',
      });
    }

    return entries;
  }

  private async fetchProducts(): Promise<any[]> {
    try {
      const result = await this.db.findMany('products', {
        status: 'published',
        deleted_at: null,
      });
      return result || [];
    } catch (err) {
      this.logger.warn(`Failed to fetch products for sitemap: ${err.message}`);
      return [];
    }
  }

  private async fetchCategories(): Promise<any[]> {
    try {
      const result = await this.db.findMany('categories', {
        is_active: true,
        deleted_at: null,
      });
      return result || [];
    } catch (err) {
      this.logger.warn(`Failed to fetch categories for sitemap: ${err.message}`);
      return [];
    }
  }

  private async fetchBlogPosts(): Promise<any[]> {
    try {
      const result = await this.db.findMany('blog_posts', {
        status: 'published',
        deleted_at: null,
      });
      return result || [];
    } catch (err) {
      this.logger.warn(`Failed to fetch blog posts for sitemap: ${err.message}`);
      return [];
    }
  }

  private async fetchPages(): Promise<any[]> {
    try {
      const result = await this.db.findMany('site_pages', {
        status: 'published',
        deleted_at: null,
      });
      return result || [];
    } catch (err) {
      this.logger.warn(`Failed to fetch site pages for sitemap: ${err.message}`);
      return [];
    }
  }

  // ------------------------------------------------------------------
  // XML builders
  // ------------------------------------------------------------------

  private buildSitemapXml(entries: SitemapEntry[]): string {
    const urls = entries
      .map(
        (e) => `  <url>
    <loc>${this.escapeXml(e.loc)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }

  /**
   * When total URLs exceed 50 000 we produce a sitemap index that
   * references numbered sub-sitemaps served at /sitemap-{n}.xml.
   */
  private buildSitemapIndex(entries: SitemapEntry[]): string {
    const baseUrl = this.getFrontendUrl();
    const chunkCount = Math.ceil(entries.length / this.MAX_URLS_PER_SITEMAP);
    const now = this.toW3CDate(new Date().toISOString());

    const refs = Array.from({ length: chunkCount }, (_, i) => {
      return `  <sitemap>
    <loc>${this.escapeXml(baseUrl)}/sitemap-${i + 1}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${refs}
</sitemapindex>`;
  }

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  private toW3CDate(dateStr: string): string {
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
