import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  TransactionType,
  TransactionStatus,
  TopUpWalletDto,
  TransferFundsDto,
  PayWithWalletDto,
  GetTransactionsDto,
} from './dto/wallet.dto';
import Stripe from 'stripe';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private stripe: Stripe;

  constructor(private readonly db: DatabaseService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Get or create wallet for user
   */
  async getOrCreateWallet(userId: string): Promise<any> {
    // Try to find existing wallet
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('wallets')
      .select('*')
      .where('user_id', userId)
      .get();

    if (existing && existing.length > 0) {
      return this.transformWallet(existing[0]);
    }

    // Create new wallet
    const newWallet = await /* TODO: replace client call */ this.db.client.query
      .from('wallets')
      .insert({
        user_id: userId,
        balance: 0,
        currency: 'USD',
        pending_balance: 0,
        total_credited: 0,
        total_debited: 0,
        total_refunded: 0,
        status: 'active',
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformWallet(newWallet[0]);
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(userId: string): Promise<any> {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      balance: wallet.balance,
      pendingBalance: wallet.pendingBalance,
      currency: wallet.currency,
      status: wallet.status,
    };
  }

  /**
   * Create top-up payment intent
   */
  async createTopupIntent(userId: string, amount: number, currency: string = 'usd'): Promise<any> {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.status !== 'active') {
      throw new ForbiddenException('Wallet is not active');
    }

    // Create Stripe payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency.toLowerCase(),
      metadata: {
        userId,
        walletId: wallet.id,
        type: 'wallet_topup',
      },
    });

    // Create pending topup record
    const topup = await /* TODO: replace client call */ this.db.client.query
      .from('wallet_topups')
      .insert({
        wallet_id: wallet.id,
        user_id: userId,
        amount: amount / 100, // Convert cents to dollars
        currency: currency.toUpperCase(),
        payment_method: 'stripe',
        payment_status: 'pending',
        payment_intent_id: paymentIntent.id,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return {
      topupId: topup[0].id,
      clientSecret: paymentIntent.client_secret,
      amount: amount / 100,
      currency: currency.toUpperCase(),
    };
  }

  /**
   * Confirm top-up after successful payment
   */
  async confirmTopup(topupId: string, paymentIntentId: string): Promise<any> {
    // Get topup record
    const topups = await /* TODO: replace client call */ this.db.client.query
      .from('wallet_topups')
      .select('*')
      .where('id', topupId)
      .where('payment_intent_id', paymentIntentId)
      .get();

    if (!topups || topups.length === 0) {
      throw new NotFoundException('Topup not found');
    }

    const topup = topups[0];

    if (topup.status === 'completed') {
      throw new BadRequestException('Topup already completed');
    }

    // Verify payment intent with Stripe
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not successful');
    }

    // Get wallet
    const wallets = await /* TODO: replace client call */ this.db.client.query
      .from('wallets')
      .select('*')
      .where('id', topup.wallet_id)
      .get();

    if (!wallets || wallets.length === 0) {
      throw new NotFoundException('Wallet not found');
    }

    const wallet = wallets[0];
    const balanceBefore = parseFloat(wallet.balance) || 0;
    const amount = parseFloat(topup.amount) || 0;
    const bonusAmount = parseFloat(topup.bonus_amount) || 0;
    const totalAmount = amount + bonusAmount;
    const balanceAfter = balanceBefore + totalAmount;

    // Update wallet balance
    await /* TODO: replace client call */ this.db.client.query
      .from('wallets')
      .where('id', wallet.id)
      .update({
        balance: balanceAfter,
        total_credited: (parseFloat(wallet.total_credited) || 0) + totalAmount,
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Create transaction record
    await /* TODO: replace client call */ this.db.client.query
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id: wallet.user_id,
        type: TransactionType.TOPUP,
        amount: totalAmount,
        currency: topup.currency,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        status: TransactionStatus.COMPLETED,
        reference_type: 'topup',
        reference_id: topupId,
        external_reference: paymentIntentId,
        description: `Wallet top-up of ${topup.currency} ${amount}${bonusAmount > 0 ? ` + ${bonusAmount} bonus` : ''}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Update topup status
    await /* TODO: replace client call */ this.db.client.query
      .from('wallet_topups')
      .where('id', topupId)
      .update({
        status: 'completed',
        payment_status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    return {
      success: true,
      newBalance: balanceAfter,
      amount: totalAmount,
      message: 'Wallet topped up successfully',
    };
  }

  /**
   * Transfer funds to another user
   */
  async transferFunds(userId: string, dto: TransferFundsDto): Promise<any> {
    const { recipientId, amount, description } = dto;

    // Get sender wallet
    const senderWallet = await this.getOrCreateWallet(userId);

    if (senderWallet.status !== 'active') {
      throw new ForbiddenException('Your wallet is not active');
    }

    if (senderWallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    if (recipientId === userId) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    // Verify recipient exists by checking if they have a wallet or can create one
    let recipientUser: any = null;
    try {
      recipientUser = await this.db.getUserById(recipientId);
    } catch (e) {
      // If getUserById fails, we'll still try to get/create wallet
      this.logger.warn(`Could not verify recipient user: ${recipientId}`);
    }

    // Get recipient wallet
    const recipientWallet = await this.getOrCreateWallet(recipientUser?.id || recipientId);

    if (recipientWallet.status !== 'active') {
      throw new BadRequestException('Recipient wallet is not active');
    }

    const senderBalanceBefore = senderWallet.balance;
    const senderBalanceAfter = senderBalanceBefore - amount;
    const recipientBalanceBefore = recipientWallet.balance;
    const recipientBalanceAfter = recipientBalanceBefore + amount;

    // Debit sender
    await /* TODO: replace client call */ this.db.client.query
      .from('wallets')
      .where('id', senderWallet.id)
      .update({
        balance: senderBalanceAfter,
        total_debited: (senderWallet.totalDebited || 0) + amount,
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Credit recipient
    await /* TODO: replace client call */ this.db.client.query
      .from('wallets')
      .where('id', recipientWallet.id)
      .update({
        balance: recipientBalanceAfter,
        total_credited: (recipientWallet.totalCredited || 0) + amount,
        updated_at: new Date().toISOString(),
      })
      .execute();

    const transferDescription = description || `Transfer to user ${recipientId}`;
    const timestamp = new Date().toISOString();

    // Create sender transaction
    await /* TODO: replace client call */ this.db.client.query
      .from('wallet_transactions')
      .insert({
        wallet_id: senderWallet.id,
        user_id: userId,
        type: TransactionType.TRANSFER_OUT,
        amount,
        currency: senderWallet.currency,
        balance_before: senderBalanceBefore,
        balance_after: senderBalanceAfter,
        status: TransactionStatus.COMPLETED,
        reference_type: 'transfer',
        recipient_wallet_id: recipientWallet.id,
        description: transferDescription,
        created_at: timestamp,
        updated_at: timestamp,
      })
      .execute();

    // Create recipient transaction
    await /* TODO: replace client call */ this.db.client.query
      .from('wallet_transactions')
      .insert({
        wallet_id: recipientWallet.id,
        user_id: recipientUser.id,
        type: TransactionType.TRANSFER_IN,
        amount,
        currency: recipientWallet.currency,
        balance_before: recipientBalanceBefore,
        balance_after: recipientBalanceAfter,
        status: TransactionStatus.COMPLETED,
        reference_type: 'transfer',
        sender_wallet_id: senderWallet.id,
        description: `Transfer from ${userId}`,
        created_at: timestamp,
        updated_at: timestamp,
      })
      .execute();

    return {
      success: true,
      newBalance: senderBalanceAfter,
      amount,
      recipientId,
      message: 'Transfer successful',
    };
  }

  /**
   * Pay for order with wallet
   */
  async payWithWallet(userId: string, dto: PayWithWalletDto): Promise<any> {
    const { orderId, amount } = dto;

    // Get wallet
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.status !== 'active') {
      throw new ForbiddenException('Wallet is not active');
    }

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    // Verify order exists and belongs to user
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

    if (order.payment_status === 'paid') {
      throw new BadRequestException('Order already paid');
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amount;

    // Debit wallet
    await /* TODO: replace client call */ this.db.client.query
      .from('wallets')
      .where('id', wallet.id)
      .update({
        balance: balanceAfter,
        total_debited: (wallet.totalDebited || 0) + amount,
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Create transaction
    const transaction = await /* TODO: replace client call */ this.db.client.query
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id: userId,
        type: TransactionType.PAYMENT,
        amount,
        currency: wallet.currency,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        status: TransactionStatus.COMPLETED,
        reference_type: 'order',
        reference_id: orderId,
        description: `Payment for order #${order.order_number || orderId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    // Update order payment status
    await /* TODO: replace client call */ this.db.client.query
      .from('orders')
      .where('id', orderId)
      .update({
        payment_status: 'paid',
        payment_method: 'wallet',
        updated_at: new Date().toISOString(),
      })
      .execute();

    return {
      success: true,
      newBalance: balanceAfter,
      transactionId: transaction[0].id,
      message: 'Payment successful',
    };
  }

  /**
   * Credit wallet (for refunds, cashback, etc.)
   */
  async creditWallet(
    userId: string,
    amount: number,
    type: TransactionType,
    referenceType?: string,
    referenceId?: string,
    description?: string,
  ): Promise<any> {
    const wallet = await this.getOrCreateWallet(userId);
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    // Update wallet
    await /* TODO: replace client call */ this.db.client.query
      .from('wallets')
      .where('id', wallet.id)
      .update({
        balance: balanceAfter,
        total_credited: (wallet.totalCredited || 0) + amount,
        total_refunded: type === TransactionType.REFUND
          ? (wallet.totalRefunded || 0) + amount
          : wallet.totalRefunded,
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Create transaction
    const transaction = await /* TODO: replace client call */ this.db.client.query
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id: userId,
        type,
        amount,
        currency: wallet.currency,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        status: TransactionStatus.COMPLETED,
        reference_type: referenceType,
        reference_id: referenceId,
        description: description || `${type} of ${wallet.currency} ${amount}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return {
      success: true,
      newBalance: balanceAfter,
      transactionId: transaction[0].id,
    };
  }

  /**
   * Get transaction history
   */
  async getTransactions(userId: string, dto: GetTransactionsDto): Promise<any> {
    const { type, status, startDate, endDate, limit, offset } = dto;

    let query = /* TODO: replace client call */ this.db.client.query
      .from('wallet_transactions')
      .select('*')
      .where('user_id', userId);

    if (type) {
      query = query.where('type', type);
    }

    if (status) {
      query = query.where('status', status);
    }

    if (startDate) {
      query = query.where('created_at', '>=', startDate);
    }

    if (endDate) {
      query = query.where('created_at', '<=', endDate);
    }

    const transactions = await query
      .orderBy('created_at', 'DESC')
      .limit(limit || 20)
      .offset(offset || 0)
      .get();

    return (transactions || []).map(this.transformTransaction);
  }

  /**
   * Admin: Adjust wallet balance
   */
  async adminAdjustBalance(
    adminUserId: string,
    targetUserId: string,
    amount: number,
    reason: string,
    notes?: string,
  ): Promise<any> {
    const wallet = await this.getOrCreateWallet(targetUserId);
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    if (balanceAfter < 0) {
      throw new BadRequestException('Adjustment would result in negative balance');
    }

    const type = amount >= 0 ? TransactionType.CREDIT : TransactionType.DEBIT;

    // Update wallet
    await /* TODO: replace client call */ this.db.client.query
      .from('wallets')
      .where('id', wallet.id)
      .update({
        balance: balanceAfter,
        total_credited: amount > 0 ? (wallet.totalCredited || 0) + amount : wallet.totalCredited,
        total_debited: amount < 0 ? (wallet.totalDebited || 0) + Math.abs(amount) : wallet.totalDebited,
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Create transaction
    await /* TODO: replace client call */ this.db.client.query
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id: targetUserId,
        type,
        amount: Math.abs(amount),
        currency: wallet.currency,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        status: TransactionStatus.COMPLETED,
        reference_type: 'admin',
        description: reason,
        notes: notes,
        metadata: { adjusted_by: adminUserId },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    return {
      success: true,
      previousBalance: balanceBefore,
      newBalance: balanceAfter,
      adjustment: amount,
    };
  }

  /**
   * Transform wallet from DB to API response
   */
  private transformWallet(wallet: any): any {
    return {
      id: wallet.id,
      userId: wallet.user_id,
      balance: parseFloat(wallet.balance) || 0,
      currency: wallet.currency,
      pendingBalance: parseFloat(wallet.pending_balance) || 0,
      status: wallet.status,
      isVerified: wallet.is_verified,
      totalCredited: parseFloat(wallet.total_credited) || 0,
      totalDebited: parseFloat(wallet.total_debited) || 0,
      totalRefunded: parseFloat(wallet.total_refunded) || 0,
      dailyLimit: wallet.daily_limit ? parseFloat(wallet.daily_limit) : null,
      monthlyLimit: wallet.monthly_limit ? parseFloat(wallet.monthly_limit) : null,
      createdAt: wallet.created_at,
      updatedAt: wallet.updated_at,
    };
  }

  /**
   * Transform transaction from DB to API response
   */
  private transformTransaction(transaction: any): any {
    return {
      id: transaction.id,
      type: transaction.type,
      amount: parseFloat(transaction.amount) || 0,
      currency: transaction.currency,
      balanceBefore: parseFloat(transaction.balance_before) || 0,
      balanceAfter: parseFloat(transaction.balance_after) || 0,
      status: transaction.status,
      referenceType: transaction.reference_type,
      referenceId: transaction.reference_id,
      description: transaction.description,
      createdAt: transaction.created_at,
    };
  }
}
