import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RefundService } from '../refund/refund.service';
import {
  ReturnStatus,
  ProductCondition,
  CreateReturnRequestDto,
  RejectReturnDto,
  ReceiveReturnDto,
  GetReturnsDto,
} from './dto/returns.dto';
import { RefundReason, RefundMethod } from '../refund/dto/refund.dto';
import { NotificationType, NotificationPriority } from '../../database/schema';

const DEFAULT_RETURN_POLICY_DAYS = 30;

@Injectable()
export class ReturnsService {
  private readonly logger = new Logger(ReturnsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly notificationsService: NotificationsService,
    private readonly refundService: RefundService,
  ) {}

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Generate an RMA number in the format RMA-YYYYMMDD-XXXXX
   */
  private generateRmaNumber(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = String(Math.floor(10000 + Math.random() * 90000)); // 5-digit random
    return `RMA-${y}${m}${d}-${rand}`;
  }

  /**
   * Transform a DB row into the API response shape
   */
  private transformReturn(row: any): any {
    return {
      id: row.id,
      rmaNumber: row.rma_number,
      orderId: row.order_id,
      userId: row.user_id,
      vendorId: row.vendor_id,
      status: row.status,
      reason: row.reason,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      productCondition: row.product_condition || null,
      rejectionReason: row.rejection_reason || null,
      refundId: row.refund_id || null,
      returnPolicyDays: row.return_policy_days,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Fetch a return row by ID (raw DB row). Throws NotFoundException if missing.
   */
  private async fetchReturnRow(returnId: string): Promise<any> {
    const rows = await this.db.client.query
      .from('returns')
      .select('*')
      .where('id', returnId)
      .get();

    if (!rows || rows.length === 0) {
      throw new NotFoundException('Return request not found');
    }
    return rows[0];
  }

  /**
   * Look up the return-policy window (days) for a given shop.
   * Falls back to DEFAULT_RETURN_POLICY_DAYS.
   */
  private async getReturnPolicyDays(shopId: string): Promise<number> {
    try {
      const shops = await this.db.client.query
        .from('shops')
        .select('return_policy_days')
        .where('id', shopId)
        .get();

      if (shops && shops.length > 0 && shops[0].return_policy_days != null) {
        return parseInt(shops[0].return_policy_days, 10);
      }
    } catch {
      // column may not exist yet; fall through
    }
    return DEFAULT_RETURN_POLICY_DAYS;
  }

  // ============================================
  // BUYER ACTIONS
  // ============================================

  /**
   * Request a return (buyer)
   */
  async requestReturn(
    userId: string,
    dto: CreateReturnRequestDto,
  ): Promise<any> {
    const { orderId, items, reason } = dto;

    // 1. Fetch order & validate ownership
    const orders = await this.db.client.query
      .from('orders')
      .select('*')
      .where('id', orderId)
      .where('user_id', userId)
      .get();

    if (!orders || orders.length === 0) {
      throw new NotFoundException('Order not found');
    }
    const order = orders[0];

    // 2. Order must be in a returnable state
    if (!['delivered', 'completed'].includes(order.status)) {
      throw new BadRequestException(
        'Order is not eligible for return. Order must be delivered or completed.',
      );
    }

    // 3. Check return window
    const shopId = order.shop_id;
    const policyDays = await this.getReturnPolicyDays(shopId);

    const completedAt = order.completed_at || order.delivered_at || order.updated_at;
    if (completedAt) {
      const deadline = new Date(completedAt);
      deadline.setDate(deadline.getDate() + policyDays);
      if (new Date() > deadline) {
        throw new BadRequestException(
          `Return window of ${policyDays} days has expired for this order.`,
        );
      }
    }

    // 4. Prevent duplicate open return for same order
    const existing = await this.db.client.query
      .from('returns')
      .select('*')
      .where('order_id', orderId)
      .where('user_id', userId)
      .whereIn('status', [
        ReturnStatus.REQUESTED,
        ReturnStatus.APPROVED,
        ReturnStatus.RECEIVED,
      ])
      .get();

    if (existing && existing.length > 0) {
      throw new BadRequestException(
        'There is already an open return request for this order.',
      );
    }

    // 5. Generate RMA & persist
    const rmaNumber = this.generateRmaNumber();
    const now = new Date().toISOString();

    const inserted = await this.db.client.query
      .from('returns')
      .insert({
        order_id: orderId,
        user_id: userId,
        vendor_id: shopId,
        rma_number: rmaNumber,
        status: ReturnStatus.REQUESTED,
        reason,
        items: JSON.stringify(items),
        return_policy_days: policyDays,
        created_at: now,
        updated_at: now,
      })
      .returning('*')
      .execute();

    const returnRow = inserted[0];

    // 6. Notify vendor
    try {
      const shops = await this.db.client.query
        .from('shops')
        .select('owner_id')
        .where('id', shopId)
        .get();

      if (shops && shops.length > 0) {
        const ownerId = shops[0].owner_id;
        await this.notificationsService.create({
          userId: ownerId,
          type: NotificationType.SHOP_MESSAGE,
          title: 'New Return Request',
          message: `A customer has requested a return (${rmaNumber}) for order #${order.order_number || orderId}.`,
          data: { returnId: returnRow.id, rmaNumber, orderId },
          actionUrl: `/vendor/returns`,
          priority: NotificationPriority.HIGH,
        });
      }
    } catch (err) {
      this.logger.error('Failed to notify vendor about return request', err);
    }

    return this.transformReturn(returnRow);
  }

  /**
   * List returns for a buyer
   */
  async getReturnsByUser(userId: string, dto: GetReturnsDto): Promise<any[]> {
    let query = this.db.client.query
      .from('returns')
      .select('*')
      .where('user_id', userId);

    if (dto.status) {
      query = query.where('status', dto.status);
    }

    const rows = await query
      .orderBy('created_at', 'DESC')
      .limit(dto.limit || 20)
      .offset(dto.offset || 0)
      .get();

    return (rows || []).map((r: any) => this.transformReturn(r));
  }

  // ============================================
  // VENDOR ACTIONS
  // ============================================

  /**
   * Approve a return request (vendor)
   */
  async approveReturn(vendorId: string, returnId: string): Promise<any> {
    const row = await this.fetchReturnRow(returnId);

    // Verify vendor ownership
    await this.assertVendorOwnership(vendorId, row.vendor_id);

    if (row.status !== ReturnStatus.REQUESTED) {
      throw new BadRequestException(
        'Only return requests in "requested" status can be approved.',
      );
    }

    const now = new Date().toISOString();
    await this.db.client.query
      .from('returns')
      .where('id', returnId)
      .update({ status: ReturnStatus.APPROVED, updated_at: now })
      .execute();

    // Notify buyer
    try {
      await this.notificationsService.create({
        userId: row.user_id,
        type: NotificationType.SHOP_MESSAGE,
        title: 'Return Approved',
        message: `Your return request ${row.rma_number} has been approved. Please ship the item(s) back.`,
        data: { returnId, rmaNumber: row.rma_number },
        actionUrl: `/returns/${returnId}`,
        priority: NotificationPriority.NORMAL,
      });
    } catch (err) {
      this.logger.error('Failed to notify buyer about return approval', err);
    }

    return { success: true, status: ReturnStatus.APPROVED, message: 'Return request approved' };
  }

  /**
   * Reject a return request (vendor)
   */
  async rejectReturn(
    vendorId: string,
    returnId: string,
    dto: RejectReturnDto,
  ): Promise<any> {
    const row = await this.fetchReturnRow(returnId);
    await this.assertVendorOwnership(vendorId, row.vendor_id);

    if (row.status !== ReturnStatus.REQUESTED) {
      throw new BadRequestException(
        'Only return requests in "requested" status can be rejected.',
      );
    }

    const now = new Date().toISOString();
    await this.db.client.query
      .from('returns')
      .where('id', returnId)
      .update({
        status: ReturnStatus.REJECTED,
        rejection_reason: dto.reason,
        updated_at: now,
      })
      .execute();

    // Notify buyer
    try {
      await this.notificationsService.create({
        userId: row.user_id,
        type: NotificationType.SHOP_MESSAGE,
        title: 'Return Rejected',
        message: `Your return request ${row.rma_number} has been rejected. Reason: ${dto.reason}`,
        data: { returnId, rmaNumber: row.rma_number, rejectionReason: dto.reason },
        actionUrl: `/returns/${returnId}`,
        priority: NotificationPriority.HIGH,
      });
    } catch (err) {
      this.logger.error('Failed to notify buyer about return rejection', err);
    }

    return { success: true, status: ReturnStatus.REJECTED, message: 'Return request rejected' };
  }

  /**
   * Mark a return as received and assess product condition (vendor)
   */
  async receiveReturn(
    vendorId: string,
    returnId: string,
    dto: ReceiveReturnDto,
  ): Promise<any> {
    const row = await this.fetchReturnRow(returnId);
    await this.assertVendorOwnership(vendorId, row.vendor_id);

    if (row.status !== ReturnStatus.APPROVED) {
      throw new BadRequestException(
        'Only approved returns can be marked as received.',
      );
    }

    const now = new Date().toISOString();
    await this.db.client.query
      .from('returns')
      .where('id', returnId)
      .update({
        status: ReturnStatus.RECEIVED,
        product_condition: dto.condition,
        updated_at: now,
      })
      .execute();

    // Auto-restock if condition is acceptable
    if (
      dto.condition === ProductCondition.LIKE_NEW ||
      dto.condition === ProductCondition.GOOD
    ) {
      await this.restockItems(row);
    } else {
      this.logger.warn(
        `Return ${returnId} received with condition "${dto.condition}" — flagged for manual review.`,
      );
    }

    // Notify buyer
    try {
      await this.notificationsService.create({
        userId: row.user_id,
        type: NotificationType.SHOP_MESSAGE,
        title: 'Return Received',
        message: `Your returned item(s) for ${row.rma_number} have been received by the vendor.`,
        data: { returnId, rmaNumber: row.rma_number, condition: dto.condition },
        actionUrl: `/returns/${returnId}`,
        priority: NotificationPriority.NORMAL,
      });
    } catch (err) {
      this.logger.error('Failed to notify buyer about return receipt', err);
    }

    return {
      success: true,
      status: ReturnStatus.RECEIVED,
      condition: dto.condition,
      restocked:
        dto.condition === ProductCondition.LIKE_NEW ||
        dto.condition === ProductCondition.GOOD,
      message: 'Return marked as received',
    };
  }

  /**
   * Process refund for a received return (vendor)
   * Delegates to the existing RefundService.
   */
  async processRefund(vendorId: string, returnId: string): Promise<any> {
    const row = await this.fetchReturnRow(returnId);
    await this.assertVendorOwnership(vendorId, row.vendor_id);

    if (row.status !== ReturnStatus.RECEIVED) {
      throw new BadRequestException(
        'Refund can only be processed after the return is received.',
      );
    }

    // Delegate to existing refund module
    const refundResult = await this.refundService.createRefundRequest(
      row.user_id,
      {
        orderId: row.order_id,
        reason: RefundReason.OTHER,
        description: `Refund for return ${row.rma_number}. Reason: ${row.reason}`,
        items: [],
        preferredMethod: RefundMethod.ORIGINAL_PAYMENT,
      },
    );

    const now = new Date().toISOString();
    await this.db.client.query
      .from('returns')
      .where('id', returnId)
      .update({
        status: ReturnStatus.REFUNDED,
        refund_id: refundResult.id,
        updated_at: now,
      })
      .execute();

    // Notify buyer
    try {
      await this.notificationsService.create({
        userId: row.user_id,
        type: NotificationType.REFUND_PROCESSED,
        title: 'Return Refund Processed',
        message: `A refund has been initiated for your return ${row.rma_number}.`,
        data: { returnId, rmaNumber: row.rma_number, refundId: refundResult.id },
        actionUrl: `/returns/${returnId}`,
        priority: NotificationPriority.NORMAL,
      });
    } catch (err) {
      this.logger.error('Failed to notify buyer about return refund', err);
    }

    return {
      success: true,
      status: ReturnStatus.REFUNDED,
      refundId: refundResult.id,
      message: 'Refund processed for return',
    };
  }

  /**
   * List returns for a vendor
   */
  async getReturnsByVendor(
    vendorId: string,
    dto: GetReturnsDto,
  ): Promise<any[]> {
    // Resolve shops owned by this vendor
    const shops = await this.db.client.query
      .from('shops')
      .select('id')
      .where('owner_id', vendorId)
      .get();

    if (!shops || shops.length === 0) {
      return [];
    }

    const shopIds = shops.map((s: any) => s.id);

    let query = this.db.client.query
      .from('returns')
      .select('*')
      .whereIn('vendor_id', shopIds);

    if (dto.status) {
      query = query.where('status', dto.status);
    }

    const rows = await query
      .orderBy('created_at', 'DESC')
      .limit(dto.limit || 20)
      .offset(dto.offset || 0)
      .get();

    return (rows || []).map((r: any) => this.transformReturn(r));
  }

  /**
   * Get a single return by ID (accessible by buyer or vendor)
   */
  async getReturnById(returnId: string, userId?: string): Promise<any> {
    const row = await this.fetchReturnRow(returnId);

    // If userId provided, verify access (buyer or vendor owner)
    if (userId && row.user_id !== userId) {
      // Check if the user is the shop owner
      const shops = await this.db.client.query
        .from('shops')
        .select('id')
        .where('id', row.vendor_id)
        .where('owner_id', userId)
        .get();

      if (!shops || shops.length === 0) {
        throw new ForbiddenException('You do not have access to this return request.');
      }
    }

    return this.transformReturn(row);
  }

  // ============================================
  // INTERNAL HELPERS
  // ============================================

  /**
   * Assert that the given userId is the owner of the shop (vendor_id).
   */
  private async assertVendorOwnership(
    userId: string,
    shopId: string,
  ): Promise<void> {
    const shops = await this.db.client.query
      .from('shops')
      .select('id')
      .where('id', shopId)
      .where('owner_id', userId)
      .get();

    if (!shops || shops.length === 0) {
      throw new ForbiddenException('You do not own the shop for this return request.');
    }
  }

  /**
   * Increment product stock for each returned item.
   */
  private async restockItems(returnRow: any): Promise<void> {
    try {
      const items =
        typeof returnRow.items === 'string'
          ? JSON.parse(returnRow.items)
          : returnRow.items;

      if (!Array.isArray(items)) return;

      for (const item of items) {
        const productId = item.productId || item.product_id;
        const qty = item.quantity || 1;

        if (!productId) continue;

        const products = await this.db.client.query
          .from('products')
          .select('stock')
          .where('id', productId)
          .get();

        if (products && products.length > 0) {
          const currentStock = parseInt(products[0].stock, 10) || 0;
          await this.db.client.query
            .from('products')
            .where('id', productId)
            .update({
              stock: currentStock + qty,
              updated_at: new Date().toISOString(),
            })
            .execute();

          this.logger.log(
            `Restocked product ${productId}: ${currentStock} -> ${currentStock + qty}`,
          );
        }
      }
    } catch (err) {
      this.logger.error('Failed to restock items for return', err);
    }
  }
}
