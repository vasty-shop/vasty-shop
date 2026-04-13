import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
  Header,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { SitemapService } from './sitemap.service';
import { StructuredDataService } from './structured-data.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('SEO')
@Controller()
export class SeoController {
  constructor(
    private readonly sitemapService: SitemapService,
    private readonly structuredDataService: StructuredDataService,
    private readonly configService: ConfigService,
  ) {}

  // ------------------------------------------------------------------
  // Public: Sitemap & Robots
  // ------------------------------------------------------------------

  @Get('/sitemap.xml')
  @ApiOperation({ summary: 'XML Sitemap for search engine crawlers' })
  @ApiResponse({ status: 200, description: 'XML sitemap' })
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  async sitemap(@Res() res: Response) {
    const xml = await this.sitemapService.getSitemap();
    res.send(xml);
  }

  @Get('/robots.txt')
  @ApiOperation({ summary: 'Robots.txt for search engine crawlers' })
  @ApiResponse({ status: 200, description: 'robots.txt content' })
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=86400')
  async robots(@Res() res: Response) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('APP_URL') ||
      'https://localhost:3000';

    const content = [
      'User-agent: *',
      'Allow: /',
      `Sitemap: ${frontendUrl}/sitemap.xml`,
      'Disallow: /admin',
      'Disallow: /api',
    ].join('\n');

    res.send(content);
  }

  // ------------------------------------------------------------------
  // Public: Structured Data
  // ------------------------------------------------------------------

  @Get('seo/product/:id')
  @ApiOperation({ summary: 'JSON-LD structured data for a product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product JSON-LD' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async productJsonLd(@Param('id') id: string) {
    return this.structuredDataService.getProductJsonLd(id);
  }

  @Get('seo/breadcrumb')
  @ApiOperation({ summary: 'BreadcrumbList JSON-LD from a URL path' })
  @ApiQuery({ name: 'path', description: 'URL path, e.g. /category/subcategory/product' })
  @ApiResponse({ status: 200, description: 'BreadcrumbList JSON-LD' })
  async breadcrumbJsonLd(@Query('path') path: string) {
    return this.structuredDataService.getBreadcrumbJsonLd(path || '/');
  }

  // ------------------------------------------------------------------
  // Admin: Rebuild Sitemap
  // ------------------------------------------------------------------

  @Post('admin/seo/rebuild-sitemap')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Force rebuild the sitemap cache' })
  @ApiResponse({ status: 200, description: 'Sitemap rebuilt' })
  async rebuildSitemap() {
    await this.sitemapService.rebuild();
    return { success: true, message: 'Sitemap cache rebuilt successfully' };
  }
}
