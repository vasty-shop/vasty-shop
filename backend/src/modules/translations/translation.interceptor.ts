import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatabaseService } from '../database/database.service';

/**
 * Interceptor that overlays translated fields on product/category responses
 * when an Accept-Language header or ?locale= query param is present.
 *
 * Fallback chain: requested locale -> default locale (en) -> original fields.
 */
@Injectable()
export class TranslationInterceptor implements NestInterceptor {
  private readonly TABLE = 'entity_translations';

  constructor(private readonly db: DatabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const locale = this.extractLocale(request);

    if (!locale || locale === 'en') {
      return next.handle();
    }

    const entityType = this.detectEntityType(request);
    if (!entityType) {
      return next.handle();
    }

    return next.handle().pipe(
      map(async (data) => {
        try {
          return await this.applyTranslations(data, entityType, locale);
        } catch {
          return data;
        }
      }),
      // Unwrap the inner promise
      map((val) => (val instanceof Promise ? val : Promise.resolve(val))),
      map((promise) => promise),
    );
  }

  private extractLocale(request: any): string | null {
    // Query param takes precedence
    if (request.query?.locale) {
      return request.query.locale;
    }

    // Then check Accept-Language header
    const acceptLang = request.headers['accept-language'];
    if (acceptLang) {
      // Parse first language from Accept-Language (e.g. "ja,en;q=0.9" -> "ja")
      const primary = acceptLang.split(',')[0]?.split(';')[0]?.trim();
      if (primary) {
        // Normalise: "ja-JP" -> "ja"
        return primary.split('-')[0].toLowerCase();
      }
    }

    return null;
  }

  private detectEntityType(request: any): string | null {
    const path = request.route?.path || request.url || '';
    if (path.includes('product')) return 'product';
    if (path.includes('categor')) return 'category';
    return null;
  }

  private async applyTranslations(
    data: any,
    entityType: string,
    locale: string,
  ): Promise<any> {
    if (!data) return data;

    // Handle array responses (list endpoints)
    if (Array.isArray(data)) {
      return Promise.all(
        data.map((item) => this.translateEntity(item, entityType, locale)),
      );
    }

    // Handle paginated responses with a data property
    if (data.data && Array.isArray(data.data)) {
      const translated = await Promise.all(
        data.data.map((item: any) => this.translateEntity(item, entityType, locale)),
      );
      return { ...data, data: translated };
    }

    // Handle single entity
    if (data.id) {
      return this.translateEntity(data, entityType, locale);
    }

    return data;
  }

  private async translateEntity(
    entity: any,
    entityType: string,
    locale: string,
  ): Promise<any> {
    if (!entity?.id) return entity;

    const translation = await this.db.findOne(this.TABLE, {
      entity_type: entityType,
      entity_id: entity.id,
      locale,
    });

    if (!translation?.translated_fields) return entity;

    const fields = translation.translated_fields;
    const result = { ...entity };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== null && value !== undefined && value !== '') {
        result[key] = value;
      }
    }

    result._locale = locale;
    result._translated = true;

    return result;
  }
}
