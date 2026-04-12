import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

/**
 * Subscription Renewal Cron Job
 *
 * Runs daily at midnight UTC to process subscription renewals.
 *
 * This uses a simple setInterval-based scheduler since @nestjs/schedule
 * is not currently installed. To use @nestjs/schedule instead:
 *
 *   1. npm install @nestjs/schedule
 *   2. Import ScheduleModule.forRoot() in AppModule
 *   3. Replace the setInterval with:
 *      @Cron('0 0 * * *', { timeZone: 'UTC' })
 *      async handleRenewals() { ... }
 */
@Injectable()
export class SubscriptionsCron {
  private readonly logger = new Logger(SubscriptionsCron.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly subscriptionsService: SubscriptionsService) {
    // Run daily (every 24 hours). First run happens 24h after startup.
    // For immediate first run on startup, use onModuleInit pattern.
    this.intervalHandle = setInterval(
      () => this.handleRenewals(),
      24 * 60 * 60 * 1000, // 24 hours
    );

    this.logger.log('Subscription renewal cron scheduled (every 24 hours)');
  }

  async handleRenewals() {
    this.logger.log('Starting daily subscription renewal processing...');
    try {
      const stats = await this.subscriptionsService.processRenewals();
      this.logger.log(`Renewal processing complete: ${JSON.stringify(stats)}`);
    } catch (error) {
      this.logger.error('Renewal processing failed', error);
    }
  }

  /**
   * Manual trigger for renewal processing (useful for testing/admin)
   */
  async triggerRenewals() {
    return this.handleRenewals();
  }

  onModuleDestroy() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }
}
