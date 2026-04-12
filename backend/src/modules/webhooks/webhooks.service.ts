import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { DatabaseService } from '../database/database.service';
import {
  RegisterWebhookDto,
  WebhookEntity,
  WebhookDeliveryEntity,
  WebhookEventType,
} from './dto/webhooks.dto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Register a new webhook endpoint for a vendor.
   */
  async registerWebhook(
    vendorId: string,
    dto: RegisterWebhookDto,
  ): Promise<WebhookEntity> {
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await this.db.insert('webhooks', {
      vendor_id: vendorId,
      url: dto.url,
      events: JSON.stringify(dto.events),
      secret,
      is_active: dto.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return this.normalizeWebhook(webhook);
  }

  /**
   * List all webhooks for a vendor.
   */
  async listWebhooks(vendorId: string): Promise<WebhookEntity[]> {
    const rows = await this.db.findMany('webhooks', { vendor_id: vendorId });
    return (rows || []).map((r: any) => this.normalizeWebhook(r));
  }

  /**
   * Delete a webhook owned by the vendor.
   */
  async deleteWebhook(vendorId: string, webhookId: string): Promise<void> {
    const webhook = await this.db.findOne('webhooks', {
      id: webhookId,
      vendor_id: vendorId,
    });
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }
    await this.db.delete('webhooks', webhookId);
  }

  /**
   * Get delivery logs for a specific webhook.
   */
  async getDeliveries(
    vendorId: string,
    webhookId: string,
  ): Promise<WebhookDeliveryEntity[]> {
    // Verify ownership
    const webhook = await this.db.findOne('webhooks', {
      id: webhookId,
      vendor_id: vendorId,
    });
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const rows = await this.db.findMany('webhook_deliveries', {
      webhook_id: webhookId,
    });
    return rows || [];
  }

  /**
   * Deliver a webhook event to all matching subscribers.
   * Called internally by other services when business events occur.
   * This method is fire-and-forget — errors are logged but never thrown.
   */
  async deliverWebhook(
    event: WebhookEventType,
    payload: Record<string, any>,
  ): Promise<void> {
    try {
      // Find all active webhooks subscribed to this event
      const allWebhooks = await this.db.findMany('webhooks', { is_active: true });
      const matching = (allWebhooks || []).filter((wh: any) => {
        const events = this.parseEvents(wh.events);
        return events.includes(event);
      });

      if (matching.length === 0) return;

      // Fire deliveries concurrently
      await Promise.allSettled(
        matching.map((wh: any) =>
          this.deliverToEndpoint(wh, event, payload),
        ),
      );
    } catch (err) {
      this.logger.error(`Error delivering webhook event ${event}: ${err.message}`);
    }
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private async deliverToEndpoint(
    webhook: any,
    event: WebhookEventType,
    payload: Record<string, any>,
  ): Promise<void> {
    const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
    const signature = this.sign(body, webhook.secret);

    let deliveryId: string | undefined;
    let lastStatus: number | null = null;
    let lastBody: string | null = null;
    let attempts = 0;
    const MAX_RETRIES = 3;

    // Create delivery log entry
    try {
      const delivery = await this.db.insert('webhook_deliveries', {
        webhook_id: webhook.id,
        event_type: event,
        payload: JSON.stringify(payload),
        response_status: null,
        response_body: null,
        attempts: 0,
        last_attempt_at: null,
        created_at: new Date().toISOString(),
      });
      deliveryId = delivery?.id;
    } catch (err) {
      this.logger.warn(`Failed to create delivery log: ${err.message}`);
    }

    for (let i = 0; i < MAX_RETRIES; i++) {
      attempts++;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event,
          },
          body,
          signal: controller.signal,
        });

        clearTimeout(timeout);
        lastStatus = response.status;
        lastBody = await response.text().catch(() => '');

        if (response.ok) {
          this.logger.log(
            `Webhook delivered: ${event} -> ${webhook.url} (${response.status})`,
          );
          break;
        }

        this.logger.warn(
          `Webhook delivery failed (attempt ${attempts}): ${event} -> ${webhook.url} (${response.status})`,
        );
      } catch (err) {
        this.logger.warn(
          `Webhook delivery error (attempt ${attempts}): ${event} -> ${webhook.url}: ${err.message}`,
        );
        lastBody = err.message;
      }

      // Exponential backoff: 1s, 2s, 4s
      if (i < MAX_RETRIES - 1) {
        await this.sleep(1000 * Math.pow(2, i));
      }
    }

    // Update delivery log
    if (deliveryId) {
      try {
        await this.db.update('webhook_deliveries', deliveryId, {
          response_status: lastStatus,
          response_body: lastBody ? lastBody.substring(0, 2000) : null,
          attempts,
          last_attempt_at: new Date().toISOString(),
        });
      } catch (err) {
        this.logger.warn(`Failed to update delivery log: ${err.message}`);
      }
    }
  }

  private sign(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  private parseEvents(events: any): WebhookEventType[] {
    let arr: string[];
    if (Array.isArray(events)) {
      arr = events;
    } else if (typeof events === 'string') {
      try {
        arr = JSON.parse(events);
      } catch {
        return [];
      }
    } else {
      return [];
    }
    return arr as WebhookEventType[];
  }

  private normalizeWebhook(row: any): WebhookEntity {
    return {
      id: row.id,
      vendor_id: row.vendor_id,
      url: row.url,
      events: this.parseEvents(row.events),
      secret: row.secret,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
