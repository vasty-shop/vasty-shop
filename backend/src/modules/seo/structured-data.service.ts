import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class StructuredDataService {
  private readonly logger = new Logger(StructuredDataService.name);

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
   * Build JSON-LD Product structured data for a given product ID.
   */
  async getProductJsonLd(productId: string): Promise<Record<string, any>> {
    const product = await this.db.findOne('products', { id: productId });
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    // Fetch shop (seller) data
    let shopName = 'Vasty Shop';
    if (product.shop_id) {
      try {
        const shop = await this.db.findOne('shops', { id: product.shop_id });
        if (shop) {
          shopName = shop.name || shopName;
        }
      } catch (err) {
        this.logger.warn(`Failed to fetch shop for product ${productId}: ${err.message}`);
      }
    }

    const images = this.extractImages(product);
    const primaryImage = images.length > 0 ? images[0] : undefined;
    const currency = this.configService.get<string>('DEFAULT_CURRENCY', 'USD');

    const availability = this.resolveAvailability(product);
    const price = product.sale_price || product.price;

    const jsonLd: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.meta_title || product.name,
      description: product.meta_description || this.truncate(product.description, 5000),
      sku: product.sku,
      offers: {
        '@type': 'Offer',
        price: String(price),
        priceCurrency: currency,
        availability,
        seller: {
          '@type': 'Organization',
          name: shopName,
        },
      },
    };

    if (primaryImage) {
      jsonLd.image = primaryImage;
    }

    if (product.brand) {
      jsonLd.brand = {
        '@type': 'Brand',
        name: product.brand,
      };
    }

    if (product.rating && product.total_reviews > 0) {
      jsonLd.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: String(product.rating),
        reviewCount: String(product.total_reviews),
      };
    }

    return jsonLd;
  }

  /**
   * Build BreadcrumbList JSON-LD from a URL path like
   * /category/subcategory/product
   */
  async getBreadcrumbJsonLd(path: string): Promise<Record<string, any>> {
    const baseUrl = this.getFrontendUrl();
    const segments = path
      .replace(/^\/+|\/+$/g, '')
      .split('/')
      .filter(Boolean);

    const items = segments.map((segment, idx) => {
      const href = `${baseUrl}/${segments.slice(0, idx + 1).join('/')}`;
      return {
        '@type': 'ListItem',
        position: idx + 1,
        name: this.slugToTitle(segment),
        item: href,
      };
    });

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items,
    };
  }

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  private extractImages(product: any): string[] {
    if (!product.images) return [];
    try {
      const imgs = typeof product.images === 'string'
        ? JSON.parse(product.images)
        : product.images;
      if (Array.isArray(imgs)) {
        return imgs.map((img: any) => (typeof img === 'string' ? img : img.url)).filter(Boolean);
      }
    } catch {
      // ignore parse errors
    }
    return [];
  }

  private resolveAvailability(product: any): string {
    if (product.status === 'out_of_stock' || (product.track_inventory && product.stock <= 0 && !product.allow_backorder)) {
      return 'https://schema.org/OutOfStock';
    }
    if (product.allow_backorder && product.stock <= 0) {
      return 'https://schema.org/BackOrder';
    }
    return 'https://schema.org/InStock';
  }

  private truncate(text: string | undefined | null, maxLen: number): string {
    if (!text) return '';
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen - 3) + '...';
  }

  private slugToTitle(slug: string): string {
    return slug
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
