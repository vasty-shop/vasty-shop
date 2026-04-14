import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { StorageService } from '../storage/storage.service';
import { EntityType } from '../../database/schema';
import { randomBytes } from 'crypto';

@Injectable()
export class DigitalProductsService {
  private readonly logger = new Logger(DigitalProductsService.name);
  private readonly bucket: string;

  constructor(
    private readonly db: DatabaseService,
    private readonly storage: StorageService,
    private readonly configService: ConfigService,
  ) {
    this.bucket = this.configService.get('R2_BUCKET', 'vasty-digital');
  }

  // ============================================
  // Digital File Management (Vendor)
  // ============================================

  /**
   * Upload a digital file for a product
   */
  async uploadFile(
    productId: string,
    shopId: string,
    file: Express.Multer.File,
    downloadLimit?: number,
  ) {
    // Verify product exists and belongs to the shop
    const product = await this.db.getEntity(EntityType.PRODUCT, productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.shop_id !== shopId && product.shopId !== shopId) {
      throw new ForbiddenException('This product does not belong to your shop');
    }

    // Upload file to storage
    const storagePath = `digital-products/${productId}/${Date.now()}-${file.originalname}`;
    await this.storage.uploadFile(this.bucket, file.buffer, storagePath, {
      contentType: file.mimetype,
      metadata: { productId, originalName: file.originalname },
    });

    // Store metadata in database
    const digitalFile = await this.db.insert('product_digital_files', {
      product_id: productId,
      file_name: file.originalname,
      file_path: storagePath,
      file_size: file.size,
      mime_type: file.mimetype,
      download_limit: downloadLimit || null,
    });

    // Mark product as digital if not already
    if (!product.is_digital) {
      await this.db.update(EntityType.PRODUCT, productId, { is_digital: true });
    }

    this.logger.log(`Digital file uploaded for product ${productId}: ${file.originalname}`);

    return {
      id: digitalFile.id,
      productId,
      fileName: digitalFile.file_name,
      fileSize: digitalFile.file_size,
      mimeType: digitalFile.mime_type,
      downloadLimit: digitalFile.download_limit,
      createdAt: digitalFile.created_at,
    };
  }

  /**
   * List digital files for a product
   */
  async listFiles(productId: string) {
    const files = await this.db.findMany('product_digital_files', { product_id: productId });

    return (files || []).map((f: any) => ({
      id: f.id,
      productId: f.product_id,
      fileName: f.file_name,
      fileSize: f.file_size,
      mimeType: f.mime_type,
      downloadLimit: f.download_limit,
      createdAt: f.created_at,
    }));
  }

  /**
   * Delete a digital file
   */
  async deleteFile(fileId: string, shopId: string) {
    const file = await this.db.findOne('product_digital_files', { id: fileId });
    if (!file) {
      throw new NotFoundException('Digital file not found');
    }

    // Verify the product belongs to this shop
    const product = await this.db.getEntity(EntityType.PRODUCT, file.product_id);
    if (!product) {
      throw new NotFoundException('Associated product not found');
    }
    if (product.shop_id !== shopId && product.shopId !== shopId) {
      throw new ForbiddenException('This file does not belong to your shop');
    }

    // Delete from storage
    try {
      await this.storage.deleteFile(this.bucket, file.file_path);
    } catch (err) {
      this.logger.warn(`Failed to delete file from storage: ${file.file_path}`, err);
    }

    // Delete metadata
    await this.db.delete('product_digital_files', fileId);

    // Check if product still has digital files
    const remainingFiles = await this.db.findMany('product_digital_files', { product_id: file.product_id });
    if (!remainingFiles || remainingFiles.length === 0) {
      await this.db.update(EntityType.PRODUCT, file.product_id, { is_digital: false });
    }

    this.logger.log(`Digital file ${fileId} deleted for product ${file.product_id}`);

    return { success: true, message: 'Digital file deleted' };
  }

  // ============================================
  // Secure Downloads (Buyer)
  // ============================================

  /**
   * Get a signed download URL for a purchased digital product
   */
  async getDownloadUrl(orderId: string, productId: string, userId: string, ipAddress?: string) {
    // Verify the order exists and belongs to this user
    const order = await this.db.getEntity(EntityType.ORDER, orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.user_id !== userId && order.userId !== userId) {
      throw new ForbiddenException('This order does not belong to you');
    }

    // Verify the order contains this product
    const orderItems = order.items || [];
    const hasProduct = orderItems.some(
      (item: any) => item.productId === productId || item.product_id === productId,
    );
    if (!hasProduct) {
      throw new BadRequestException('This product is not part of the specified order');
    }

    // Verify the order is paid/completed
    const validStatuses = ['paid', 'processing', 'shipped', 'delivered', 'completed'];
    const validPaymentStatuses = ['paid', 'succeeded', 'completed'];
    const orderStatus = order.status || '';
    const paymentStatus = order.payment_status || order.paymentStatus || '';

    if (!validStatuses.includes(orderStatus) && !validPaymentStatuses.includes(paymentStatus)) {
      throw new BadRequestException('Order payment has not been completed');
    }

    // Get digital files for this product
    const files = await this.db.findMany('product_digital_files', { product_id: productId });
    if (!files || files.length === 0) {
      throw new NotFoundException('No digital files found for this product');
    }

    // Build download URLs for each file
    const downloads = [];

    for (const file of files) {
      // Check download limit
      if (file.download_limit !== null && file.download_limit !== undefined) {
        const downloadCount = await this.db.findMany('product_downloads', {
          order_id: orderId,
          file_id: file.id,
        });
        if (downloadCount && downloadCount.length >= file.download_limit) {
          downloads.push({
            fileId: file.id,
            fileName: file.file_name,
            error: 'Download limit reached',
            downloadsUsed: downloadCount.length,
            downloadLimit: file.download_limit,
          });
          continue;
        }
      }

      // Generate signed URL (1 hour expiry)
      const signedUrl = await this.storage.createSignedUrl(this.bucket, file.file_path, 3600);

      // Track the download
      await this.db.insert('product_downloads', {
        order_id: orderId,
        product_id: productId,
        user_id: userId,
        file_id: file.id,
        ip_address: ipAddress || null,
      });

      downloads.push({
        fileId: file.id,
        fileName: file.file_name,
        fileSize: file.file_size,
        mimeType: file.mime_type,
        downloadUrl: signedUrl,
        expiresIn: 3600,
      });
    }

    return { orderId, productId, downloads };
  }

  // ============================================
  // License Key Management
  // ============================================

  /**
   * Generate a license key in XXXX-XXXX-XXXX-XXXX format
   */
  private generateKey(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
    const segments: string[] = [];
    for (let s = 0; s < 4; s++) {
      const bytes = randomBytes(4);
      let segment = '';
      for (let i = 0; i < 4; i++) {
        segment += chars[bytes[i] % chars.length];
      }
      segments.push(segment);
    }
    return segments.join('-');
  }

  /**
   * Generate one or more license keys for a product (pre-stock)
   */
  async generateLicenseKeys(productId: string, shopId: string, count: number = 1) {
    // Verify product exists and belongs to shop
    const product = await this.db.getEntity(EntityType.PRODUCT, productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.shop_id !== shopId && product.shopId !== shopId) {
      throw new ForbiddenException('This product does not belong to your shop');
    }

    const keys: any[] = [];
    for (let i = 0; i < count; i++) {
      const key = this.generateKey();
      const license = await this.db.insert('product_licenses', {
        product_id: productId,
        license_key: key,
        is_active: true,
      });
      keys.push({
        id: license.id,
        licenseKey: license.license_key,
        isActive: license.is_active,
        createdAt: license.created_at,
      });
    }

    this.logger.log(`Generated ${count} license key(s) for product ${productId}`);
    return keys;
  }

  /**
   * List license keys for a product (vendor view)
   */
  async listLicenseKeys(productId: string, shopId: string) {
    const product = await this.db.getEntity(EntityType.PRODUCT, productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.shop_id !== shopId && product.shopId !== shopId) {
      throw new ForbiddenException('This product does not belong to your shop');
    }

    const licenses = await this.db.findMany('product_licenses', { product_id: productId });
    return (licenses || []).map((l: any) => ({
      id: l.id,
      licenseKey: l.license_key,
      orderId: l.order_id,
      userId: l.user_id,
      isActive: l.is_active,
      activatedAt: l.activated_at,
      createdAt: l.created_at,
    }));
  }

  /**
   * Validate a license key (public endpoint)
   */
  async validateLicenseKey(key: string) {
    const license = await this.db.findOne('product_licenses', { license_key: key });
    if (!license) {
      return { valid: false, message: 'License key not found' };
    }

    const product = await this.db.getEntity(EntityType.PRODUCT, license.product_id);

    return {
      valid: license.is_active,
      licenseKey: license.license_key,
      productId: license.product_id,
      productName: product?.name || null,
      activatedAt: license.activated_at,
      isActive: license.is_active,
    };
  }

  /**
   * Assign a license key to an order (called on order completion)
   */
  async assignLicenseToOrder(productId: string, orderId: string, userId: string): Promise<string | null> {
    // Find an unassigned license key for this product
    const license = await this.db.findOne('product_licenses', {
      product_id: productId,
      order_id: null,
    });

    if (!license) {
      this.logger.warn(`No available license key for product ${productId}, generating new one`);
      // Auto-generate a new license key
      const key = this.generateKey();
      const newLicense = await this.db.insert('product_licenses', {
        product_id: productId,
        order_id: orderId,
        user_id: userId,
        license_key: key,
        is_active: true,
        activated_at: new Date().toISOString(),
      });
      return newLicense.license_key;
    }

    // Assign existing license to this order
    await this.db.update('product_licenses', license.id, {
      order_id: orderId,
      user_id: userId,
      activated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return license.license_key;
  }

  // ============================================
  // Auto-delivery on Order Completion
  // ============================================

  /**
   * Process digital delivery for a completed order.
   * Called when an order status changes to a paid/completed state.
   */
  async processDigitalDelivery(orderId: string) {
    const order = await this.db.getEntity(EntityType.ORDER, orderId);
    if (!order) {
      this.logger.warn(`processDigitalDelivery: Order ${orderId} not found`);
      return;
    }

    const userId = order.user_id || order.userId;
    const items = order.items || [];
    const digitalItems: Array<{ productName: string; files: any[]; licenseKey?: string }> = [];

    for (const item of items) {
      const productId = item.productId || item.product_id;
      if (!productId) continue;

      const product = await this.db.getEntity(EntityType.PRODUCT, productId);
      if (!product || !product.is_digital) continue;

      // Get digital files
      const files = await this.db.findMany('product_digital_files', { product_id: productId });
      if (!files || files.length === 0) continue;

      // Assign license key if the product has licenses
      const existingLicenses = await this.db.findMany('product_licenses', { product_id: productId });
      let licenseKey: string | null = null;

      if (existingLicenses && existingLicenses.length > 0) {
        licenseKey = await this.assignLicenseToOrder(productId, orderId, userId);
      }

      digitalItems.push({
        productName: product.name || item.name,
        files: files.map((f: any) => ({
          fileName: f.file_name,
          fileSize: f.file_size,
        })),
        licenseKey,
      });
    }

    if (digitalItems.length === 0) {
      return; // No digital products in this order
    }

    // Send delivery email
    await this.sendDigitalDeliveryEmail(order, userId, digitalItems);

    this.logger.log(`Digital delivery processed for order ${orderId}: ${digitalItems.length} digital product(s)`);
  }

  /**
   * Send email with download links and license keys
   */
  private async sendDigitalDeliveryEmail(
    order: any,
    userId: string,
    items: Array<{ productName: string; files: any[]; licenseKey?: string }>,
  ) {
    // Get user email
    let userEmail: string | null = null;
    try {
      const user = await this.db.getUserById(userId);
      userEmail = user?.email || null;
    } catch {
      this.logger.warn(`Could not fetch email for user ${userId}`);
    }

    if (!userEmail) {
      // Try from order shipping address or billing
      userEmail = order.email || order.shippingAddress?.email || order.shipping_address?.email;
    }

    if (!userEmail) {
      this.logger.warn(`No email found for user ${userId}, skipping digital delivery email`);
      return;
    }

    const orderId = order.id;
    const orderNumber = order.order_number || order.orderNumber || orderId;

    // Build email HTML
    let itemsHtml = '';
    for (const item of items) {
      itemsHtml += `
        <div style="margin-bottom: 20px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0; color: #111827;">${item.productName}</h3>
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
            ${item.files.length} file(s) available for download
          </p>
          ${item.licenseKey ? `
            <div style="margin-top: 8px; padding: 12px; background: #f0fdf4; border-radius: 4px;">
              <p style="margin: 0; font-size: 13px; color: #166534;">License Key:</p>
              <p style="margin: 4px 0 0 0; font-family: monospace; font-size: 16px; font-weight: bold; color: #15803d;">
                ${item.licenseKey}
              </p>
            </div>
          ` : ''}
        </div>
      `;
    }

    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h2 style="color: #111827;">Your Digital Products are Ready!</h2>
        <p style="color: #4b5563;">
          Thank you for your purchase (Order #${orderNumber}). Your digital products are ready for download.
        </p>

        ${itemsHtml}

        <div style="margin-top: 24px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #4b5563;">
            To download your files, log into your account and go to your order details.
            Download links are time-limited and will be regenerated each time you request them.
          </p>
        </div>

        <p style="margin-top: 24px; font-size: 13px; color: #9ca3af;">
          If you have any issues with your downloads, please contact us.
        </p>
      </div>
    `;

    try {
      await this.db.sendEmail(
        userEmail,
        `Your Digital Products - Order #${orderNumber}`,
        html,
      );
      this.logger.log(`Digital delivery email sent to ${userEmail} for order ${orderId}`);
    } catch (err) {
      this.logger.error(`Failed to send digital delivery email to ${userEmail}`, err);
    }
  }
}
