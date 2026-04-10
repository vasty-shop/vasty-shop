import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { WalletService } from '../wallet/wallet.service';
import {
  RefundStatus,
  RefundReason,
  RefundMethod,
  CreateRefundRequestDto,
  ProcessRefundDto,
  GetRefundsDto,
} from './dto/refund.dto';
import { TransactionType } from '../wallet/dto/wallet.dto';

@Injectable()
export class RefundService {
  private readonly logger = new Logger(RefundService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly walletService: WalletService,
  ) {}

  /**
   * Create a refund request
   */
  async createRefundRequest(userId: string, dto: CreateRefundRequestDto): Promise<any> {
    const { orderId, reason, description, images, items, preferredMethod } = dto;

    // Get order
    const orders = await /* TODO: replace client call */ this.db.client.query
      .from('orders')
      .select('*')
      .where('id', orderId)
      .where('user_id', userId)
      .get();

    if (!orders || orders.length === 0) {
      throw new NotFoundException('Order not found');
    }

    const order = orders[0];

    // Check if order is eligible for refund
    if (!['delivered', 'completed'].includes(order.status)) {
      throw new BadRequestException('Order is not eligible for refund. Order must be delivered or completed.');
    }

    // Check if there's already a pending refund request
    const existingRefunds = await /* TODO: replace client call */ this.db.client.query
      .from('refund_requests')
      .select('*')
      .where('order_id', orderId)
      .where('user_id', userId)
      .whereIn('status', ['pending', 'approved', 'processing'])
      .get();

    if (existingRefunds && existingRefunds.length > 0) {
      throw new BadRequestException('There is already a pending refund request for this order');
    }

    // Calculate refund amount
    let amountRequested = parseFloat(order.total) || 0;

    if (items && items.length > 0) {
      // Partial refund - calculate based on items
      const orderItems = await /* TODO: replace client call */ this.db.client.query
        .from('order_items')
        .select('*')
        .where('order_id', orderId)
        .get();

      amountRequested = 0;
      for (const item of items) {
        const orderItem = orderItems.find((oi: any) => oi.id === item.orderItemId);
        if (orderItem) {
          const itemPrice = parseFloat(orderItem.price) || 0;
          amountRequested += itemPrice * item.quantity;
        }
      }
    }

    // Create refund request
    const refundRequest = await /* TODO: replace client call */ this.db.client.query
      .from('refund_requests')
      .insert({
        order_id: orderId,
        user_id: userId,
        shop_id: order.shop_id,
        reason,
        description: description || '',
        images: JSON.stringify(images || []),
        items: JSON.stringify(items || []),
        amount_requested: amountRequested,
        currency: order.currency || 'USD',
        status: RefundStatus.PENDING,
        refund_method: preferredMethod || null,
        refund_to_wallet: preferredMethod === RefundMethod.WALLET,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformRefund(refundRequest[0]);
  }

  /**
   * Get user's refund requests
   */
  async getUserRefunds(userId: string, dto: GetRefundsDto): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('refund_requests')
      .select('*')
      .where('user_id', userId);

    if (dto.status) {
      query = query.where('status', dto.status);
    }

    if (dto.orderId) {
      query = query.where('order_id', dto.orderId);
    }

    if (dto.startDate) {
      query = query.where('created_at', '>=', dto.startDate);
    }

    if (dto.endDate) {
      query = query.where('created_at', '<=', dto.endDate);
    }

    const refunds = await query
      .orderBy('created_at', 'DESC')
      .limit(dto.limit || 20)
      .offset(dto.offset || 0)
      .get();

    return (refunds || []).map(this.transformRefund);
  }

  /**
   * Get shop's refund requests (for vendors)
   */
  async getShopRefunds(shopId: string, dto: GetRefundsDto): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('refund_requests')
      .select('*')
      .where('shop_id', shopId);

    if (dto.status) {
      query = query.where('status', dto.status);
    }

    if (dto.orderId) {
      query = query.where('order_id', dto.orderId);
    }

    if (dto.startDate) {
      query = query.where('created_at', '>=', dto.startDate);
    }

    if (dto.endDate) {
      query = query.where('created_at', '<=', dto.endDate);
    }

    const refunds = await query
      .orderBy('created_at', 'DESC')
      .limit(dto.limit || 20)
      .offset(dto.offset || 0)
      .get();

    return (refunds || []).map(this.transformRefund);
  }

  /**
   * Get refund request by ID
   */
  async getRefundById(refundId: string, userId?: string): Promise<any> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('refund_requests')
      .select('*')
      .where('id', refundId);

    if (userId) {
      query = query.where('user_id', userId);
    }

    const refunds = await query.get();

    if (!refunds || refunds.length === 0) {
      throw new NotFoundException('Refund request not found');
    }

    return this.transformRefund(refunds[0]);
  }

  /**
   * Process refund request (approve/reject) - for vendors/admins
   */
  async processRefund(dto: ProcessRefundDto, reviewerId: string): Promise<any> {
    const { refundId, action, approvedAmount, refundMethod, refundToWallet, adminNotes } = dto;

    // Get refund request
    const refunds = await /* TODO: replace client call */ this.db.client.query
      .from('refund_requests')
      .select('*')
      .where('id', refundId)
      .get();

    if (!refunds || refunds.length === 0) {
      throw new NotFoundException('Refund request not found');
    }

    const refund = refunds[0];

    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException('Refund request has already been processed');
    }

    const timestamp = new Date().toISOString();

    if (action === 'reject') {
      // Reject the refund
      await /* TODO: replace client call */ this.db.client.query
        .from('refund_requests')
        .where('id', refundId)
        .update({
          status: RefundStatus.REJECTED,
          reviewed_by: reviewerId,
          reviewed_at: timestamp,
          admin_notes: adminNotes || '',
          updated_at: timestamp,
        })
        .execute();

      return {
        success: true,
        status: RefundStatus.REJECTED,
        message: 'Refund request rejected',
      };
    }

    // Approve the refund
    const finalAmount = approvedAmount ?? parseFloat(refund.amount_requested);
    const finalMethod = refundToWallet ? RefundMethod.WALLET : (refundMethod || RefundMethod.ORIGINAL_PAYMENT);

    // Update refund status to approved/processing
    await /* TODO: replace client call */ this.db.client.query
      .from('refund_requests')
      .where('id', refundId)
      .update({
        status: RefundStatus.APPROVED,
        amount_approved: finalAmount,
        refund_method: finalMethod,
        refund_to_wallet: refundToWallet,
        reviewed_by: reviewerId,
        reviewed_at: timestamp,
        admin_notes: adminNotes || '',
        updated_at: timestamp,
      })
      .execute();

    // Process the refund based on method
    let transactionId: string | null = null;

    if (refundToWallet || finalMethod === RefundMethod.WALLET) {
      // Refund to wallet
      const walletResult = await this.walletService.creditWallet(
        refund.user_id,
        finalAmount,
        TransactionType.REFUND,
        'refund',
        refundId,
        `Refund for order #${refund.order_id}`,
      );
      transactionId = walletResult.transactionId;
    }

    // Mark as completed
    await /* TODO: replace client call */ this.db.client.query
      .from('refund_requests')
      .where('id', refundId)
      .update({
        status: RefundStatus.COMPLETED,
        transaction_id: transactionId,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Update order status
    await /* TODO: replace client call */ this.db.client.query
      .from('orders')
      .where('id', refund.order_id)
      .update({
        status: 'refunded',
        updated_at: new Date().toISOString(),
      })
      .execute();

    return {
      success: true,
      status: RefundStatus.COMPLETED,
      amountRefunded: finalAmount,
      refundMethod: finalMethod,
      transactionId,
      message: 'Refund processed successfully',
    };
  }

  /**
   * Cancel refund request (by user, only if pending)
   */
  async cancelRefund(refundId: string, userId: string): Promise<any> {
    const refunds = await /* TODO: replace client call */ this.db.client.query
      .from('refund_requests')
      .select('*')
      .where('id', refundId)
      .where('user_id', userId)
      .get();

    if (!refunds || refunds.length === 0) {
      throw new NotFoundException('Refund request not found');
    }

    const refund = refunds[0];

    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException('Only pending refund requests can be cancelled');
    }

    await /* TODO: replace client call */ this.db.client.query
      .from('refund_requests')
      .where('id', refundId)
      .update({
        status: RefundStatus.CANCELLED,
        updated_at: new Date().toISOString(),
      })
      .execute();

    return {
      success: true,
      message: 'Refund request cancelled',
    };
  }

  /**
   * Get refund reasons
   */
  async getRefundReasons(): Promise<any[]> {
    const reasons = await /* TODO: replace client call */ this.db.client.query
      .from('refund_reasons')
      .select('*')
      .where('is_active', true)
      .orderBy('sort_order', 'ASC')
      .get();

    if (!reasons || reasons.length === 0) {
      // Return default reasons
      return [
        { code: RefundReason.DAMAGED, name: 'Item Damaged', description: 'Product arrived damaged', requiresEvidence: true },
        { code: RefundReason.WRONG_ITEM, name: 'Wrong Item', description: 'Received wrong product', requiresEvidence: true },
        { code: RefundReason.NOT_DELIVERED, name: 'Not Delivered', description: 'Order was never delivered', requiresEvidence: false },
        { code: RefundReason.QUALITY_ISSUE, name: 'Quality Issue', description: 'Product quality not as expected', requiresEvidence: true },
        { code: RefundReason.CHANGED_MIND, name: 'Changed Mind', description: 'No longer needed', requiresEvidence: false },
        { code: RefundReason.OTHER, name: 'Other', description: 'Other reason', requiresEvidence: false },
      ];
    }

    return reasons.map((r: any) => ({
      code: r.code,
      name: r.name,
      description: r.description,
      requiresEvidence: r.requires_evidence,
    }));
  }

  /**
   * Get refund statistics (for admin/vendor)
   */
  async getRefundStats(shopId?: string): Promise<any> {
    let baseQuery = /* TODO: replace client call */ this.db.client.query.from('refund_requests').select('*');

    if (shopId) {
      baseQuery = baseQuery.where('shop_id', shopId);
    }

    const refunds = await baseQuery.get();
    const all = refunds || [];

    const stats = {
      total: all.length,
      pending: all.filter((r: any) => r.status === RefundStatus.PENDING).length,
      approved: all.filter((r: any) => r.status === RefundStatus.APPROVED).length,
      completed: all.filter((r: any) => r.status === RefundStatus.COMPLETED).length,
      rejected: all.filter((r: any) => r.status === RefundStatus.REJECTED).length,
      totalAmountRequested: all.reduce((sum: number, r: any) => sum + (parseFloat(r.amount_requested) || 0), 0),
      totalAmountRefunded: all
        .filter((r: any) => r.status === RefundStatus.COMPLETED)
        .reduce((sum: number, r: any) => sum + (parseFloat(r.amount_approved) || 0), 0),
    };

    return stats;
  }

  /**
   * Transform refund from DB to API response
   */
  private transformRefund(refund: any): any {
    return {
      id: refund.id,
      orderId: refund.order_id,
      userId: refund.user_id,
      shopId: refund.shop_id,
      reason: refund.reason,
      description: refund.description,
      images: typeof refund.images === 'string' ? JSON.parse(refund.images) : refund.images,
      items: typeof refund.items === 'string' ? JSON.parse(refund.items) : refund.items,
      amountRequested: parseFloat(refund.amount_requested) || 0,
      amountApproved: refund.amount_approved ? parseFloat(refund.amount_approved) : null,
      currency: refund.currency,
      status: refund.status,
      refundMethod: refund.refund_method,
      refundToWallet: refund.refund_to_wallet,
      transactionId: refund.transaction_id,
      reviewedBy: refund.reviewed_by,
      reviewedAt: refund.reviewed_at,
      adminNotes: refund.admin_notes,
      createdAt: refund.created_at,
      updatedAt: refund.updated_at,
      completedAt: refund.completed_at,
    };
  }
}
