import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SearchService } from './search.service';

/**
 * Search module — exposes the pluggable SearchService for full-text
 * and faceted search over products, orders, etc.
 *
 * Pick a provider by setting SEARCH_PROVIDER in your .env. See
 * `docs/providers/search.md` for the full list.
 *
 * Imports DatabaseModule because the pg-trgm provider needs raw SQL
 * access to the Postgres pool exposed by DatabaseService.
 */
@Module({
  imports: [DatabaseModule],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
