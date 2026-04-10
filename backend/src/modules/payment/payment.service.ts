import { Injectable, BadRequestException, NotFoundException, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { DatabaseService } from '../database/database.service';
import { EntityType, PaymentTransactionEntity, PaymentStatus, NotificationType } from '../../database/schema';
import { CreatePaymentIntentDto, PaymentMethod } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import {
  DirectCardPaymentDto,
  ConfigurePaymentMethodsDto,
} from './dto/configure-payment-methods.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { StripeConnectService } from './stripe-connect.service';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);
  private ordersService: any;
  private stripeConnectService: StripeConnectService;

  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
      });
      this.logger.log('Stripe client initialized with API version 2023-10-16');
    } else {
      this.logger.warn('Stripe secret key not configured. Payment processing will be unavailable.');
    }
  }

  /**
   * Set Stripe Connect service (to avoid circular dependencies)
   */
  setStripeConnectService(stripeConnectService: StripeConnectService) {
    this.stripeConnectService = stripeConnectService;
  }

  /**
   * Create a payment intent for an order (supports multiple payment methods)
   * Automatically uses Stripe Connect destination charges if the vendor has it enabled
   * @param userId - User ID making the payment
   * @param createPaymentIntentDto - Payment intent details
   * @returns Payment intent details with client secret
   */
  async createPaymentIntent(
    userId: string,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    const { orderId, amount, currency = 'USD', metadata, paymentMethod, shopId } = createPaymentIntentDto;

    if (!this.stripe) {
      throw new BadRequestException('Payment processing not configured');
    }

    try {
      // Build payment method types based on selected method
      const paymentMethodTypes = this.getPaymentMethodTypes(paymentMethod);

      // Check if shop has Stripe Connect enabled for destination charges
      let shop = null;
      let useStripeConnect = false;
      let platformFee = 0;
      let vendorAmount = amount;

      if (shopId) {
        shop = await this.db.getEntity(EntityType.SHOP, shopId);
        if (shop && shop.stripeAccountId && shop.stripeChargesEnabled) {
          useStripeConnect = true;
          // Platform fee: 1% by default (can be configured per shop)
          const platformFeePercent = shop.settings?.platformFeePercent || 1;
          platformFee = Math.round(amount * 100 * (platformFeePercent / 100));
          vendorAmount = amount - (platformFee / 100);
        }
      }

      // Create Stripe payment intent with or without destination charges
      const paymentIntentData: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        payment_method_types: paymentMethodTypes,
        metadata: {
          orderId,
          userId,
          paymentMethod,
          shopId: shopId || '',
          platform: 'vasty-shop',
          ...metadata,
        },
      };

      // Add Stripe Connect destination charges if vendor has it enabled
      if (useStripeConnect && shop) {
        paymentIntentData.application_fee_amount = platformFee;
        paymentIntentData.transfer_data = {
          destination: shop.stripeAccountId,
        };
        paymentIntentData.metadata.platformFee = platformFee.toString();
        paymentIntentData.metadata.vendorAmount = Math.round(vendorAmount * 100).toString();
        paymentIntentData.metadata.stripeConnectEnabled = 'true';

        this.logger.log(`Using Stripe Connect for shop ${shopId} - Platform fee: ${platformFee / 100}, Vendor: ${vendorAmount}`);
      }

      const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentData);

      // Create payment transaction record in database
      const transactionData: Partial<PaymentTransactionEntity> = {
        orderId,
        userId,
        amount,
        currency,
        method: paymentMethod,
        provider: 'Stripe',
        providerTransactionId: paymentIntent.id,
        stripePaymentIntentId: paymentIntent.id,
        status: PaymentStatus.PENDING,
        metadata: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentStatus: paymentIntent.status,
          paymentMethod,
          shopId: shopId || null,
          stripeConnectEnabled: useStripeConnect,
          platformFee: platformFee / 100,
          vendorAmount: useStripeConnect ? vendorAmount : null,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const transaction = await this.db.createEntity(
        EntityType.PAYMENT,
        transactionData,
      );

      this.logger.log(`Payment intent created: ${paymentIntent.id} for order ${orderId} with method ${paymentMethod}${useStripeConnect ? ' (Stripe Connect)' : ''}`);

      return {
        transactionId: transaction.id,
        clientSecret: paymentIntent.client_secret,
        amount,
        currency,
        paymentIntentId: paymentIntent.id,
        paymentMethod,
        stripeConnectEnabled: useStripeConnect,
        platformFee: platformFee / 100,
        vendorAmount: useStripeConnect ? vendorAmount : null,
      };
    } catch (error) {
      this.logger.error('Failed to create payment intent', error);
      throw new BadRequestException('Failed to create payment intent: ' + error.message);
    }
  }

  /**
   * Process direct card payment
   * @param userId - User ID making the payment
   * @param directCardPaymentDto - Direct card payment details
   * @returns Payment result
   */
  async processDirectCardPayment(
    userId: string,
    directCardPaymentDto: DirectCardPaymentDto,
  ) {
    const { orderId, amount, token, savePaymentMethod, currency = 'USD' } = directCardPaymentDto;

    if (!this.stripe) {
      throw new BadRequestException('Payment processing not configured');
    }

    try {
      // Create payment intent with automatic confirmation
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        payment_method: token,
        confirm: true,
        metadata: {
          orderId,
          userId,
          paymentMethod: PaymentMethod.CARD,
        },
        setup_future_usage: savePaymentMethod ? 'off_session' : undefined,
      });

      // Create transaction record
      const transactionData: Partial<PaymentTransactionEntity> = {
        orderId,
        userId,
        amount,
        currency,
        method: PaymentMethod.CARD,
        provider: 'Stripe',
        providerTransactionId: paymentIntent.id,
        stripePaymentIntentId: paymentIntent.id,
        stripeChargeId: paymentIntent.latest_charge as string,
        status: paymentIntent.status === 'succeeded' ? PaymentStatus.SUCCEEDED : PaymentStatus.PENDING,
        metadata: {
          paymentMethod: PaymentMethod.CARD,
          savePaymentMethod,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const transaction = await this.db.createEntity(
        EntityType.PAYMENT,
        transactionData,
      );

      this.logger.log(`Direct card payment processed: ${paymentIntent.id} for order ${orderId}`);

      // Update order status and send notifications based on payment status
      if (paymentIntent.status === 'succeeded') {
        await this.updateOrderPaymentStatus(orderId, PaymentStatus.SUCCEEDED, transaction.id);

        // Send payment success notification (database + WebSocket + email)
        try {
          await this.notificationsService.sendPaymentNotification(
            transaction.id,
            NotificationType.PAYMENT_SUCCESS,
          );
        } catch (notificationError) {
          this.logger.error('Failed to send payment success notification', notificationError);
          // Don't fail the payment if notification fails
        }
      } else {
        // Payment pending or failed - send notification
        try {
          await this.notificationsService.sendPaymentNotification(
            transaction.id,
            NotificationType.PAYMENT_FAILED,
          );
        } catch (notificationError) {
          this.logger.error('Failed to send payment failed notification', notificationError);
        }
      }

      return {
        transactionId: transaction.id,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount,
        currency,
      };
    } catch (error) {
      this.logger.error('Failed to process direct card payment', error);

      // Try to send payment failed notification on exception
      try {
        // Find transaction if it was created
        const transactions = await this.db.queryEntities(EntityType.PAYMENT, {
          filters: { orderId },
        });
        if (transactions.data && transactions.data.length > 0) {
          const failedTransaction = transactions.data[0];
          await this.notificationsService.sendPaymentNotification(
            failedTransaction.id,
            NotificationType.PAYMENT_FAILED,
          );
        }
      } catch (notificationError) {
        this.logger.error('Failed to send payment failed notification', notificationError);
      }

      throw new BadRequestException('Failed to process card payment: ' + error.message);
    }
  }

  /**
   * Configure payment methods for a shop
   * @param shopId - Shop ID
   * @param config - Payment method configuration
   * @returns Updated shop settings
   */
  async configurePaymentMethods(
    shopId: string,
    config: ConfigurePaymentMethodsDto,
  ) {
    try {
      // Get the shop
      const shop = await this.db.getEntity(EntityType.SHOP, shopId);

      if (!shop) {
        throw new NotFoundException('Shop not found');
      }

      // Update shop settings with payment configuration
      const updatedShop = await this.db.updateEntity(
        EntityType.SHOP,
        shopId,
        {
          settings: {
            ...shop.settings,
            paymentMethods: {
              card: config.card || { enabled: false },
            },
          },
          updatedAt: new Date().toISOString(),
        },
      );

      this.logger.log(`Payment methods configured for shop: ${shopId}`);

      return updatedShop;
    } catch (error) {
      this.logger.error('Failed to configure payment methods', error);
      throw new BadRequestException('Failed to configure payment methods: ' + error.message);
    }
  }

  /**
   * Get configured payment methods for a shop
   * @param shopId - Shop ID
   * @returns Payment method configuration
   */
  async getShopPaymentMethods(shopId: string) {
    try {
      const shop = await this.db.getEntity(EntityType.SHOP, shopId);

      if (!shop) {
        throw new NotFoundException('Shop not found');
      }

      this.logger.log(`[getShopPaymentMethods] Shop ID: ${shopId}`);
      this.logger.log(`[getShopPaymentMethods] Shop paymentMethods field: ${JSON.stringify(shop.paymentMethods)}`);

      // payment_methods is now a direct column on shops table: ['card', 'paypal', 'cod', 'bank']
      // Also check settings.payment_methods for backward compatibility
      const enabledMethods = shop.paymentMethods || shop.settings?.payment_methods || shop.settings?.paymentMethods || ['card'];

      this.logger.log(`[getShopPaymentMethods] Enabled methods: ${JSON.stringify(enabledMethods)}`);

      // Convert to object format for frontend compatibility
      const methodsObject: Record<string, { enabled: boolean }> = {};
      ['card', 'paypal', 'cod', 'bank', 'applepay', 'googlepay'].forEach(method => {
        methodsObject[method] = { enabled: enabledMethods.includes(method) };
      });

      this.logger.log(`[getShopPaymentMethods] Returning: ${JSON.stringify(methodsObject)}`);

      return methodsObject;
    } catch (error) {
      this.logger.error('Failed to get shop payment methods', error);
      throw new NotFoundException('Shop not found or payment methods not configured');
    }
  }

  /**
   * Helper method to get Stripe payment method types based on selected payment method
   * @param paymentMethod - Selected payment method
   * @returns Array of Stripe payment method types
   */
  private getPaymentMethodTypes(paymentMethod: PaymentMethod): string[] {
    // Only card payment is supported
    return ['card'];
  }

  /**
   * Confirm a payment after client-side processing
   * @param confirmPaymentDto - Confirmation details
   * @returns Updated transaction
   */
  async confirmPayment(confirmPaymentDto: ConfirmPaymentDto) {
    const { transactionId, paymentIntentId } = confirmPaymentDto;

    if (!this.stripe) {
      throw new BadRequestException('Payment processing not configured');
    }

    try {
      // Retrieve payment intent from Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      // Determine status
      const status =
        paymentIntent.status === 'succeeded'
          ? PaymentStatus.SUCCEEDED
          : paymentIntent.status === 'canceled'
          ? PaymentStatus.FAILED
          : PaymentStatus.PENDING;

      // Update transaction status
      const updateData: Partial<PaymentTransactionEntity> = {
        status,
        stripeChargeId: paymentIntent.latest_charge as string,
        updatedAt: new Date().toISOString(),
      };

      if (paymentIntent.status === 'succeeded') {
        updateData.metadata = {
          paidAt: new Date().toISOString(),
          // Receipt URL will be available in latest_charge if needed
        };
      } else if (paymentIntent.status === 'canceled' || paymentIntent.status === 'requires_payment_method') {
        updateData.errorMessage = (paymentIntent as any).cancellation_reason || 'Payment failed';
      }

      const transaction = await this.db.updateEntity(
        EntityType.PAYMENT,
        transactionId,
        updateData,
      );

      this.logger.log(`Payment confirmed: ${paymentIntentId} - Status: ${status}`);

      return transaction;
    } catch (error) {
      this.logger.error('Failed to confirm payment', error);
      throw new BadRequestException('Failed to confirm payment: ' + error.message);
    }
  }

  /**
   * Handle Stripe webhook events
   * @param body - Raw webhook body
   * @param signature - Stripe signature header
   * @returns Webhook acknowledgment
   */
  async handleWebhook(body: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!this.stripe || !webhookSecret) {
      throw new BadRequestException('Webhook processing not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);

      this.logger.log(`Received webhook event: ${event.type}`);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.canceled':
          await this.handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
          break;
        case 'charge.refunded':
          await this.handleRefundCompleted(event.data.object as Stripe.Charge);
          break;
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook error', error);
      throw new BadRequestException('Webhook processing failed: ' + error.message);
    }
  }

  /**
   * Process a refund for a transaction
   * @param transactionId - Transaction ID to refund
   * @param amount - Optional partial refund amount
   * @param reason - Reason for refund
   * @returns Updated transaction
   */
  async processRefund(transactionId: string, amount?: number, reason?: string) {
    const transaction = await this.getTransaction(transactionId);

    if (!this.stripe) {
      throw new BadRequestException('Payment processing not configured');
    }

    if (transaction.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Can only refund successful transactions');
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: transaction.providerTransactionId,
        amount: amount ? Math.round(amount * 100) : undefined, // undefined = full refund
        reason: 'requested_by_customer',
        metadata: {
          transactionId,
          reason: reason || 'Customer requested refund',
        },
      });

      // Update transaction with refund information
      const updateData: Partial<PaymentTransactionEntity> = {
        status: PaymentStatus.REFUNDED,
        refundAmount: amount || transaction.amount,
        refundReason: reason,
        refundedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          ...transaction.metadata,
          refundId: refund.id,
          refundStatus: refund.status,
        },
      };

      const updatedTransaction = await this.db.updateEntity(
        EntityType.PAYMENT,
        transactionId,
        updateData,
      );

      this.logger.log(`Refund processed: ${refund.id} for transaction ${transactionId}`);

      // Send refund notification to customer (database + WebSocket + email)
      try {
        await this.notificationsService.sendPaymentNotification(
          transactionId,
          NotificationType.REFUND_PROCESSED,
        );
      } catch (notificationError) {
        this.logger.error('Failed to send refund notification', notificationError);
        // Don't fail the refund if notification fails
      }

      // Update order status
      const order = await this.db.getEntity(EntityType.ORDER, transaction.orderId);
      if (order) {
        await this.db.updateEntity(EntityType.ORDER, transaction.orderId, {
          paymentStatus: 'refunded',
          refundAmount: amount || transaction.amount,
          refundedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      return updatedTransaction;
    } catch (error) {
      this.logger.error('Failed to process refund', error);
      throw new BadRequestException('Failed to process refund: ' + error.message);
    }
  }

  /**
   * Get a single transaction by ID
   * @param id - Transaction ID
   * @returns Transaction entity
   */
  async getTransaction(id: string): Promise<PaymentTransactionEntity> {
    try {
      const transaction = await this.db.getEntity(EntityType.PAYMENT, id);
      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }
      return transaction;
    } catch (error) {
      throw new NotFoundException('Transaction not found');
    }
  }

  /**
   * Get all transactions for an order
   * @param orderId - Order ID
   * @returns Array of transactions
   */
  async getOrderTransactions(orderId: string): Promise<PaymentTransactionEntity[]> {
    try {
      const result = await this.db.queryEntities(EntityType.PAYMENT, {
        filters: { orderId },
      });

      return result.data || [];
    } catch (error) {
      this.logger.error('Failed to get order transactions', error);
      return [];
    }
  }

  /**
   * Record a transaction in the database
   * @param orderId - Order ID
   * @param data - Transaction data
   * @returns Created transaction
   */
  async recordTransaction(
    orderId: string,
    data: Partial<PaymentTransactionEntity>,
  ): Promise<PaymentTransactionEntity> {
    const transactionData: Partial<PaymentTransactionEntity> = {
      orderId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.db.createEntity(EntityType.PAYMENT, transactionData);
  }

  // Private helper methods

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);

    try {
      // Find transaction by payment intent ID
      const transactions = await this.db.queryEntities(EntityType.PAYMENT, {
        filters: { providerTransactionId: paymentIntent.id },
      });

      if (transactions.data && transactions.data.length > 0) {
        const transaction = transactions.data[0];

        await this.db.updateEntity(EntityType.PAYMENT, transaction.id, {
          status: PaymentStatus.SUCCEEDED,
          stripeChargeId: paymentIntent.latest_charge as string,
          metadata: {
            ...transaction.metadata,
            paidAt: new Date().toISOString(),
            // Receipt URL available via latest_charge if needed
          },
          updatedAt: new Date().toISOString(),
        });

        // Update order status to paid
        await this.updateOrderPaymentStatus(transaction.orderId, PaymentStatus.SUCCEEDED, transaction.id);

        // Send payment success notification (database + WebSocket + email)
        try {
          await this.notificationsService.sendPaymentNotification(
            transaction.id,
            NotificationType.PAYMENT_SUCCESS,
          );
        } catch (notificationError) {
          this.logger.error('Failed to send payment success notification', notificationError);
          // Don't fail webhook processing if notification fails
        }
      }
    } catch (error) {
      this.logger.error('Failed to handle payment success', error);
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(`Payment failed: ${paymentIntent.id}`);

    try {
      const transactions = await this.db.queryEntities(EntityType.PAYMENT, {
        filters: { providerTransactionId: paymentIntent.id },
      });

      if (transactions.data && transactions.data.length > 0) {
        const transaction = transactions.data[0];

        await this.db.updateEntity(EntityType.PAYMENT, transaction.id, {
          status: PaymentStatus.FAILED,
          errorMessage: paymentIntent.last_payment_error?.message || 'Payment failed',
          updatedAt: new Date().toISOString(),
        });

        // Update order status
        await this.updateOrderPaymentStatus(transaction.orderId, PaymentStatus.FAILED, transaction.id);

        // Send payment failed notification (database + WebSocket + email)
        try {
          await this.notificationsService.sendPaymentNotification(
            transaction.id,
            NotificationType.PAYMENT_FAILED,
          );
        } catch (notificationError) {
          this.logger.error('Failed to send payment failed notification', notificationError);
          // Don't fail webhook processing if notification fails
        }
      }
    } catch (error) {
      this.logger.error('Failed to handle payment failure', error);
    }
  }

  private async handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(`Payment canceled: ${paymentIntent.id}`);

    try {
      const transactions = await this.db.queryEntities(EntityType.PAYMENT, {
        filters: { providerTransactionId: paymentIntent.id },
      });

      if (transactions.data && transactions.data.length > 0) {
        const transaction = transactions.data[0];

        await this.db.updateEntity(EntityType.PAYMENT, transaction.id, {
          status: PaymentStatus.FAILED,
          errorMessage: paymentIntent.cancellation_reason || 'Payment canceled',
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error('Failed to handle payment cancellation', error);
    }
  }

  private async handleRefundCompleted(charge: Stripe.Charge) {
    this.logger.log(`Refund completed for charge: ${charge.id}`);

    try {
      const transactions = await this.db.queryEntities(EntityType.PAYMENT, {
        filters: { stripeChargeId: charge.id },
      });

      if (transactions.data && transactions.data.length > 0) {
        const transaction = transactions.data[0];

        await this.db.updateEntity(EntityType.PAYMENT, transaction.id, {
          status: PaymentStatus.REFUNDED,
          refundedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Send refund notification (database + WebSocket + email)
        try {
          await this.notificationsService.sendPaymentNotification(
            transaction.id,
            NotificationType.REFUND_PROCESSED,
          );
        } catch (notificationError) {
          this.logger.error('Failed to send refund notification', notificationError);
          // Don't fail webhook processing if notification fails
        }
      }
    } catch (error) {
      this.logger.error('Failed to handle refund completion', error);
    }
  }

  /**
   * Set services for dependency injection (to avoid circular dependencies)
   */
  setOrdersService(ordersService: any) {
    this.ordersService = ordersService;
  }

  /**
   * Update order payment status after successful payment
   * @param orderId - Order ID
   * @param paymentStatus - Payment status
   * @param transactionId - Transaction ID
   */
  private async updateOrderPaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    transactionId: string,
  ): Promise<void> {
    try {
      const order = await this.db.getEntity(EntityType.ORDER, orderId);
      if (!order) {
        this.logger.warn(`Order not found: ${orderId}`);
        return;
      }

      const updateData: any = {
        paymentStatus: paymentStatus === PaymentStatus.SUCCEEDED ? 'paid' : 'failed',
        transactionId,
        updatedAt: new Date().toISOString(),
      };

      if (paymentStatus === PaymentStatus.SUCCEEDED) {
        updateData.paidAt = new Date().toISOString();

        // Update order status to processing if payment is successful
        if (order.status === 'pending') {
          updateData.status = 'processing';

          // Add to timeline
          if (!order.timeline) {
            order.timeline = [];
          }
          order.timeline.push({
            status: 'processing',
            timestamp: new Date().toISOString(),
            note: 'Payment confirmed, order is being processed',
          });
          updateData.timeline = order.timeline;
        }
      } else if (paymentStatus === PaymentStatus.FAILED) {
        // Add to timeline
        if (!order.timeline) {
          order.timeline = [];
        }
        order.timeline.push({
          status: 'payment_failed',
          timestamp: new Date().toISOString(),
          note: 'Payment failed',
        });
        updateData.timeline = order.timeline;
      }

      await this.db.updateEntity(EntityType.ORDER, orderId, updateData);

      this.logger.log(`Order ${orderId} payment status updated to ${paymentStatus}`);

      // Send order notification if payment succeeded
      if (paymentStatus === PaymentStatus.SUCCEEDED && this.notificationsService) {
        await this.notificationsService.sendOrderNotification(
          orderId,
          NotificationType.ORDER_PLACED,
        );
      }
    } catch (error) {
      this.logger.error('Failed to update order payment status', error);
    }
  }
}

/* Payment Service Features:
 * ✅ Direct card payments via Stripe
 * ✅ Payment method configuration per shop
 * ✅ Webhook handling for payment events
 * ✅ Refund processing
 * ✅ Payment notifications
 *
 * Stripe Connect for vendor payouts:
 * - Use DatabaseService SDK methods: createConnectAccount, getConnectOnboardingLink
 * - getConnectAccountStatus, getConnectDashboardLink
 */
