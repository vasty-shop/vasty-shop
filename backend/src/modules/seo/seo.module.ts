import { Module } from '@nestjs/common';
import { SeoController } from './seo.controller';
import { SitemapService } from './sitemap.service';
import { StructuredDataService } from './structured-data.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SeoController],
  providers: [SitemapService, StructuredDataService],
  exports: [SitemapService, StructuredDataService],
})
export class SeoModule {}
