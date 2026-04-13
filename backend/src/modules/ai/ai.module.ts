import { AuthModule } from '../auth/auth.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { AiProviderService } from './ai-provider.service';

/**
 * AI module.
 *
 * Exposes two services:
 *
 * - `AiProviderService` (NEW, pluggable)
 *   The façade over the multi-provider adapter. New code should inject
 *   this. Switch providers with `AI_PROVIDER` in .env — see
 *   `docs/providers/ai.md`.
 *
 * - `AIService` (legacy, OpenAI-hardcoded)
 *   The original service with ~900 lines of product-autofill logic
 *   directly wired to OpenAI. Still works, still exported for
 *   backwards compatibility. A follow-up PR will migrate its
 *   internals to delegate to `AiProviderService` and delete the
 *   hardcoded OpenAI fetch calls.
 */
@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [AIController],
  providers: [AIService, AiProviderService],
  exports: [AIService, AiProviderService],
})
export class AIModule {}
