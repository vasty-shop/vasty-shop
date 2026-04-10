import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  GenerateBarcodeDto,
  GenerateQRCodeDto,
  GenerateProductBarcodeDto,
  GenerateOrderQRDto,
  BulkGenerateBarcodeDto,
  ScanBarcodeDto,
  ScanQRCodeDto,
  BatchScanDto,
  AssignBarcodeDto,
  UpdateProductBarcodeDto,
  SearchByBarcodeDto,
  PrintLabelDto,
  BulkPrintLabelsDto,
  CreateLabelTemplateDto,
  UpdateLabelTemplateDto,
  InventoryScanDto,
  StartInventorySessionDto,
  InventoryScanEntryDto,
  CompleteInventorySessionDto,
  VerifyBarcodeDto,
  ValidateBarcodeFormatDto,
  ScanHistoryFilterDto,
  BarcodeType,
  QRCodeType,
  BarcodeFormat,
  ScanAction,
} from './dto/barcode.dto';

@Injectable()
export class BarcodeService {
  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // BARCODE GENERATION
  // ============================================

  async generateBarcode(dto: GenerateBarcodeDto) {
    // Validate barcode data based on type
    this.validateBarcodeData(dto.data, dto.type);

    // Generate barcode image data
    const barcodeData = {
      type: dto.type,
      data: dto.data,
      format: dto.format || BarcodeFormat.PNG,
      options: {
        width: dto.width || 200,
        height: dto.height || 100,
        backgroundColor: dto.backgroundColor || '#FFFFFF',
        lineColor: dto.lineColor || '#000000',
        includeText: dto.includeText !== false,
        fontSize: dto.fontSize || 12,
        margin: dto.margin || 10,
      },
    };

    // In production, this would use a barcode library like JsBarcode or bwip-js
    // For now, return metadata that frontend can use with a barcode library
    return {
      barcode: dto.data,
      type: dto.type,
      format: dto.format || BarcodeFormat.PNG,
      options: barcodeData.options,
      // Base64 encoded image would be generated here
      imageData: this.generateBarcodeImagePlaceholder(dto.data, dto.type),
    };
  }

  async generateQRCode(dto: GenerateQRCodeDto) {
    const qrData = this.formatQRData(dto.data, dto.type);

    return {
      data: qrData,
      type: dto.type,
      format: dto.format || BarcodeFormat.PNG,
      options: {
        size: dto.size || 200,
        errorCorrectionLevel: dto.errorCorrectionLevel || 'M',
        backgroundColor: dto.backgroundColor || '#FFFFFF',
        foregroundColor: dto.foregroundColor || '#000000',
        logoUrl: dto.logoUrl,
        logoSize: dto.logoSize || 50,
        margin: dto.margin || 4,
      },
      // QR code image would be generated here
      imageData: this.generateQRCodeImagePlaceholder(qrData),
    };
  }

  async generateProductBarcode(dto: GenerateProductBarcodeDto) {
    // Get product
    const products = await this.db.query_builder()
      .from('products')
      .select('*')
      .where('id', dto.productId)
      .get();

    if (products.length === 0) {
      throw new NotFoundException('Product not found');
    }

    const product = products[0];
    const barcodeData = product.barcode || product.sku || product.id;
    const barcodeType = dto.type || BarcodeType.CODE128;

    const barcode = await this.generateBarcode({
      data: barcodeData,
      type: barcodeType,
      format: dto.format,
      includeText: true,
    });

    return {
      ...barcode,
      product: {
        id: product.id,
        name: dto.includeName ? product.name : undefined,
        sku: dto.includeSKU ? product.sku : undefined,
        price: dto.includePrice ? product.price : undefined,
      },
    };
  }

  async generateOrderQR(dto: GenerateOrderQRDto) {
    // Get order
    const orders = await this.db.query_builder()
      .from('orders')
      .select('id', 'order_number', 'status', 'total')
      .where('id', dto.orderId)
      .get();

    if (orders.length === 0) {
      throw new NotFoundException('Order not found');
    }

    const order = orders[0];
    const qrData = JSON.stringify({
      type: 'order',
      orderId: order.id,
      orderNumber: order.order_number,
    });

    const qrCode = await this.generateQRCode({
      data: qrData,
      type: QRCodeType.ORDER,
      format: dto.format,
      size: dto.size,
      errorCorrectionLevel: dto.errorCorrectionLevel,
    });

    return {
      ...qrCode,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
      },
    };
  }

  async bulkGenerateBarcodes(dto: BulkGenerateBarcodeDto) {
    const results = await Promise.all(
      dto.items.map(item => this.generateBarcode(item))
    );

    return {
      count: results.length,
      barcodes: results,
      asZip: dto.asZip,
    };
  }

  // ============================================
  // BARCODE SCANNING
  // ============================================

  async scanBarcode(dto: ScanBarcodeDto, userId: string) {
    // Detect barcode type if not provided
    const barcodeType = dto.type || this.detectBarcodeType(dto.barcode);

    // Determine action
    const action = dto.action || ScanAction.PRODUCT_LOOKUP;

    let result: any;

    switch (action) {
      case ScanAction.PRODUCT_LOOKUP:
        result = await this.lookupProductByBarcode(dto.barcode, dto.shopId);
        break;
      case ScanAction.ORDER_LOOKUP:
        result = await this.lookupOrderByBarcode(dto.barcode);
        break;
      case ScanAction.INVENTORY_UPDATE:
        result = await this.handleInventoryScan(dto.barcode, dto.shopId);
        break;
      case ScanAction.POS_ADD_ITEM:
        result = await this.handlePOSScan(dto.barcode, dto.sessionId);
        break;
      case ScanAction.COUPON_APPLY:
        result = await this.handleCouponScan(dto.barcode);
        break;
      case ScanAction.DELIVERY_VERIFY:
        result = await this.handleDeliveryVerification(dto.barcode);
        break;
      default:
        result = { barcode: dto.barcode, type: barcodeType };
    }

    // Log scan
    await this.logScan({
      barcode: dto.barcode,
      type: barcodeType,
      action,
      userId,
      shopId: dto.shopId,
      result,
    });

    return {
      barcode: dto.barcode,
      type: barcodeType,
      action,
      result,
    };
  }

  async scanQRCode(dto: ScanQRCodeDto, userId: string) {
    // Parse QR data
    let parsedData: any;
    try {
      parsedData = JSON.parse(dto.data);
    } catch {
      parsedData = { raw: dto.data };
    }

    const qrType = parsedData.type || dto.expectedType || QRCodeType.TEXT;
    const action = dto.action || this.determineQRAction(qrType);

    let result: any;

    switch (qrType) {
      case QRCodeType.PRODUCT:
        result = await this.lookupProductByBarcode(parsedData.productId || parsedData.barcode, dto.shopId);
        break;
      case QRCodeType.ORDER:
        result = await this.lookupOrderById(parsedData.orderId);
        break;
      case QRCodeType.COUPON:
        result = await this.handleCouponScan(parsedData.code || dto.data);
        break;
      case QRCodeType.PAYMENT:
        result = { type: 'payment', data: parsedData };
        break;
      case QRCodeType.URL:
        result = { type: 'url', url: dto.data };
        break;
      default:
        result = { type: qrType, data: parsedData };
    }

    // Log scan
    await this.logScan({
      barcode: dto.data,
      type: 'QR_CODE',
      action,
      userId,
      shopId: dto.shopId,
      result,
    });

    return {
      data: dto.data,
      type: qrType,
      action,
      parsedData,
      result,
    };
  }

  async batchScan(dto: BatchScanDto, userId: string) {
    const results = await Promise.all(
      dto.barcodes.map(barcode =>
        this.scanBarcode({
          barcode,
          action: dto.action,
          shopId: dto.shopId,
        }, userId)
      )
    );

    const successful = results.filter(r => r.result && !r.result.error);
    const failed = results.filter(r => !r.result || r.result.error);

    return {
      total: dto.barcodes.length,
      successful: successful.length,
      failed: failed.length,
      results,
    };
  }

  // ============================================
  // PRODUCT BARCODE MANAGEMENT
  // ============================================

  async assignBarcode(dto: AssignBarcodeDto) {
    // Check if barcode already exists
    const existing = await this.db.query_builder()
      .from('product_barcodes')
      .select('id')
      .where('barcode', dto.barcode)
      .get();

    if (existing.length > 0) {
      throw new BadRequestException('Barcode already assigned to another product');
    }

    const assignment = await this.db.query_builder()
      .from('product_barcodes')
      .insert({
        product_id: dto.productId,
        variant_id: dto.variantId,
        barcode: dto.barcode,
        type: dto.type || BarcodeType.CODE128,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    // Also update product's main barcode field
    await this.db.query_builder()
      .from('products')
      .where('id', dto.productId)
      .update({ barcode: dto.barcode, updated_at: new Date().toISOString() })
      .execute();

    return assignment[0];
  }

  async updateProductBarcode(productId: string, dto: UpdateProductBarcodeDto) {
    const updateData: any = { updated_at: new Date().toISOString() };

    if (dto.barcode) {
      // Check if new barcode already exists
      const existing = await this.db.query_builder()
        .from('product_barcodes')
        .select('id')
        .where('barcode', dto.barcode)
        .where('product_id', '!=', productId)
        .get();

      if (existing.length > 0) {
        throw new BadRequestException('Barcode already assigned to another product');
      }

      updateData.barcode = dto.barcode;
    }
    if (dto.type) updateData.type = dto.type;

    const result = await this.db.query_builder()
      .from('product_barcodes')
      .where('product_id', productId)
      .update(updateData)
      .returning('*')
      .execute();

    // Update product's main barcode field
    if (dto.barcode) {
      await this.db.query_builder()
        .from('products')
        .where('id', productId)
        .update({ barcode: dto.barcode, updated_at: new Date().toISOString() })
        .execute();
    }

    return result[0];
  }

  async removeProductBarcode(productId: string, variantId?: string) {
    let query = this.db.query_builder()
      .from('product_barcodes')
      .where('product_id', productId);

    if (variantId) {
      query = query.where('variant_id', variantId);
    }

    await query.delete().execute();

    // Clear product's main barcode if no variant specified
    if (!variantId) {
      await this.db.query_builder()
        .from('products')
        .where('id', productId)
        .update({ barcode: null, updated_at: new Date().toISOString() })
        .execute();
    }

    return { success: true };
  }

  async searchByBarcode(dto: SearchByBarcodeDto) {
    // Search in products
    let productQuery = this.db.query_builder()
      .from('products')
      .select('*')
      .where('barcode', dto.barcode);

    if (dto.shopId) {
      productQuery = productQuery.where('shop_id', dto.shopId);
    }

    const products = await productQuery.get();

    // Also search in product_barcodes table
    let barcodeQuery = this.db.query_builder()
      .from('product_barcodes')
      .select('*')
      .where('barcode', dto.barcode);

    const barcodeRecords = await barcodeQuery.get();

    // Get variant products if requested
    let variants: any[] = [];
    if (dto.includeVariants && barcodeRecords.length > 0) {
      const variantIds = barcodeRecords
        .filter((r: any) => r.variant_id)
        .map((r: any) => r.variant_id);

      if (variantIds.length > 0) {
        variants = await this.db.query_builder()
          .from('product_variants')
          .select('*')
          .whereIn('id', variantIds)
          .get();
      }
    }

    return {
      products: products.map(this.formatProduct),
      barcodeRecords,
      variants,
      found: products.length > 0 || barcodeRecords.length > 0,
    };
  }

  async getProductBarcodes(productId: string) {
    const barcodes = await this.db.query_builder()
      .from('product_barcodes')
      .select('*')
      .where('product_id', productId)
      .get();

    return barcodes;
  }

  // ============================================
  // LABEL PRINTING
  // ============================================

  async printLabel(dto: PrintLabelDto) {
    // Get product
    const products = await this.db.query_builder()
      .from('products')
      .select('*')
      .where('id', dto.productId)
      .get();

    if (products.length === 0) {
      throw new NotFoundException('Product not found');
    }

    const product = products[0];

    // Get label template
    let template = null;
    if (dto.labelTemplate) {
      const templates = await this.db.query_builder()
        .from('label_templates')
        .select('*')
        .where('id', dto.labelTemplate)
        .get();
      template = templates[0];
    }

    // Generate barcode image if product has barcode
    let barcodeImage: string | undefined;
    if (product.barcode) {
      const barcode = await this.generateBarcode({
        data: product.barcode,
        type: BarcodeType.CODE128,
        format: BarcodeFormat.PNG,
      });
      barcodeImage = barcode.imageData;
    }

    // Generate label data
    const labelData = {
      product: {
        id: product.id,
        name: dto.includeName !== false ? product.name : undefined,
        sku: dto.includeSKU !== false ? product.sku : undefined,
        price: dto.includePrice !== false ? product.price : undefined,
        barcode: product.barcode,
        barcodeImage,
      },
      template,
      quantity: dto.quantity || 1,
      labelSize: dto.labelSize || { width: 50, height: 25, unit: 'mm' },
      printerType: dto.printerType || 'thermal',
      includeShopLogo: dto.includeShopLogo,
    };

    return {
      labels: Array(dto.quantity || 1).fill(labelData),
      printReady: true,
    };
  }

  async bulkPrintLabels(dto: BulkPrintLabelsDto) {
    const labels = await Promise.all(
      dto.productIds.map(productId =>
        this.printLabel({
          productId,
          quantity: dto.quantityEach || 1,
          labelTemplate: dto.labelTemplate,
          labelSize: dto.labelSize,
        })
      )
    );

    const allLabels = labels.flatMap(l => l.labels);

    return {
      totalLabels: allLabels.length,
      productCount: dto.productIds.length,
      labels: allLabels,
      printReady: true,
    };
  }

  async createLabelTemplate(dto: CreateLabelTemplateDto, userId: string) {
    const template = await this.db.query_builder()
      .from('label_templates')
      .insert({
        name: dto.name,
        description: dto.description,
        shop_id: dto.shopId,
        label_width: dto.labelSize.width,
        label_height: dto.labelSize.height,
        label_unit: dto.labelSize.unit || 'mm',
        elements: JSON.stringify(dto.elements),
        is_default: dto.isDefault || false,
        created_by: userId,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    // If this is default, unset other defaults
    if (dto.isDefault) {
      await this.db.query_builder()
        .from('label_templates')
        .where('shop_id', dto.shopId)
        .where('id', '!=', template[0].id)
        .update({ is_default: false })
        .execute();
    }

    return this.formatLabelTemplate(template[0]);
  }

  async getLabelTemplates(shopId: string) {
    const templates = await this.db.query_builder()
      .from('label_templates')
      .select('*')
      .where('shop_id', shopId)
      .orderBy('name', 'ASC')
      .get();

    return templates.map(this.formatLabelTemplate);
  }

  async updateLabelTemplate(id: string, dto: UpdateLabelTemplateDto) {
    const updateData: any = { updated_at: new Date().toISOString() };

    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.labelSize) {
      updateData.label_width = dto.labelSize.width;
      updateData.label_height = dto.labelSize.height;
      updateData.label_unit = dto.labelSize.unit;
    }
    if (dto.elements) updateData.elements = JSON.stringify(dto.elements);
    if (dto.isDefault !== undefined) updateData.is_default = dto.isDefault;

    const result = await this.db.query_builder()
      .from('label_templates')
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute();

    return this.formatLabelTemplate(result[0]);
  }

  async deleteLabelTemplate(id: string) {
    await this.db.query_builder()
      .from('label_templates')
      .where('id', id)
      .delete()
      .execute();

    return { success: true };
  }

  // ============================================
  // INVENTORY SCANNING
  // ============================================

  async startInventorySession(dto: StartInventorySessionDto, userId: string) {
    const session = await this.db.query_builder()
      .from('inventory_sessions')
      .insert({
        shop_id: dto.shopId,
        name: dto.name || `Inventory Count ${new Date().toISOString().split('T')[0]}`,
        description: dto.description,
        location_id: dto.locationId,
        category_ids: JSON.stringify(dto.categoryIds || []),
        status: 'in_progress',
        started_at: new Date().toISOString(),
        started_by: userId,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return session[0];
  }

  async addInventoryScanEntry(dto: InventoryScanEntryDto, userId: string) {
    // Look up product
    const searchResult = await this.searchByBarcode({ barcode: dto.barcode });

    if (!searchResult.found) {
      return {
        success: false,
        error: 'Product not found',
        barcode: dto.barcode,
      };
    }

    const product = searchResult.products[0];

    // Check if entry already exists for this product in session
    const existing = await this.db.query_builder()
      .from('inventory_scan_entries')
      .select('*')
      .where('session_id', dto.sessionId)
      .where('product_id', product.id)
      .get();

    if (existing.length > 0) {
      // Update existing entry
      const newQuantity = (existing[0].scanned_quantity || 0) + (dto.scannedQuantity || 1);
      const result = await this.db.query_builder()
        .from('inventory_scan_entries')
        .where('id', existing[0].id)
        .update({
          scanned_quantity: newQuantity,
          last_scanned_at: new Date().toISOString(),
          notes: dto.notes || existing[0].notes,
        })
        .returning('*')
        .execute();

      return {
        success: true,
        entry: result[0],
        product,
        updated: true,
      };
    }

    // Create new entry
    const entry = await this.db.query_builder()
      .from('inventory_scan_entries')
      .insert({
        session_id: dto.sessionId,
        product_id: product.id,
        barcode: dto.barcode,
        system_quantity: product.stock || 0,
        scanned_quantity: dto.scannedQuantity || 1,
        scanned_by: userId,
        first_scanned_at: new Date().toISOString(),
        last_scanned_at: new Date().toISOString(),
        notes: dto.notes,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return {
      success: true,
      entry: entry[0],
      product,
      updated: false,
    };
  }

  async getInventorySession(sessionId: string) {
    const sessions = await this.db.query_builder()
      .from('inventory_sessions')
      .select('*')
      .where('id', sessionId)
      .get();

    if (sessions.length === 0) {
      throw new NotFoundException('Session not found');
    }

    const session = sessions[0];

    // Get entries
    const entries = await this.db.query_builder()
      .from('inventory_scan_entries')
      .select('*')
      .where('session_id', sessionId)
      .orderBy('last_scanned_at', 'DESC')
      .get();

    // Calculate summary
    const summary = {
      totalProducts: entries.length,
      totalScanned: entries.reduce((sum: number, e: any) => sum + (e.scanned_quantity || 0), 0),
      totalSystemQuantity: entries.reduce((sum: number, e: any) => sum + (e.system_quantity || 0), 0),
      discrepancies: entries.filter((e: any) => e.scanned_quantity !== e.system_quantity).length,
    };

    return {
      ...session,
      categoryIds: JSON.parse(session.category_ids || '[]'),
      entries,
      summary,
    };
  }

  async completeInventorySession(dto: CompleteInventorySessionDto, userId: string) {
    const session = await this.getInventorySession(dto.sessionId);

    if (session.status !== 'in_progress') {
      throw new BadRequestException('Session is not in progress');
    }

    // Update stock if requested
    if (dto.updateStock) {
      for (const entry of session.entries) {
        await this.db.query_builder()
          .from('products')
          .where('id', entry.product_id)
          .update({
            stock: entry.scanned_quantity,
            updated_at: new Date().toISOString(),
          })
          .execute();
      }
    }

    // Complete session
    const result = await this.db.query_builder()
      .from('inventory_sessions')
      .where('id', dto.sessionId)
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: userId,
        completion_notes: dto.notes,
        stock_updated: dto.updateStock || false,
      })
      .returning('*')
      .execute();

    return {
      ...result[0],
      summary: session.summary,
      stockUpdated: dto.updateStock || false,
    };
  }

  async cancelInventorySession(sessionId: string, userId: string) {
    const result = await this.db.query_builder()
      .from('inventory_sessions')
      .where('id', sessionId)
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId,
      })
      .returning('*')
      .execute();

    return result[0];
  }

  // ============================================
  // VERIFICATION
  // ============================================

  async verifyBarcode(dto: VerifyBarcodeDto) {
    const isValid = this.validateBarcodeData(dto.barcode, dto.type);

    return {
      barcode: dto.barcode,
      type: dto.type,
      valid: isValid,
      checksum: this.calculateChecksum(dto.barcode, dto.type),
    };
  }

  async validateBarcodeFormat(dto: ValidateBarcodeFormatDto) {
    const detectedType = this.detectBarcodeType(dto.barcode);
    const isValid = dto.expectedType
      ? detectedType === dto.expectedType
      : detectedType !== null;

    return {
      barcode: dto.barcode,
      detectedType,
      expectedType: dto.expectedType,
      valid: isValid,
      formatCorrect: this.validateBarcodeData(dto.barcode, detectedType || BarcodeType.CODE128),
    };
  }

  // ============================================
  // SCAN HISTORY
  // ============================================

  async getScanHistory(dto: ScanHistoryFilterDto) {
    let query = this.db.query_builder()
      .from('barcode_scan_logs')
      .select('*');

    if (dto.userId) {
      query = query.where('user_id', dto.userId);
    }
    if (dto.shopId) {
      query = query.where('shop_id', dto.shopId);
    }
    if (dto.action) {
      query = query.where('action', dto.action);
    }
    if (dto.startDate) {
      query = query.where('created_at', '>=', dto.startDate);
    }
    if (dto.endDate) {
      query = query.where('created_at', '<=', dto.endDate);
    }

    const page = dto.page || 1;
    const limit = dto.limit || 50;
    const offset = (page - 1) * limit;

    const logs = await query
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .get();

    return logs;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private validateBarcodeData(data: string, type: BarcodeType): boolean {
    switch (type) {
      case BarcodeType.EAN13:
        return /^\d{13}$/.test(data);
      case BarcodeType.EAN8:
        return /^\d{8}$/.test(data);
      case BarcodeType.UPC_A:
        return /^\d{12}$/.test(data);
      case BarcodeType.UPC_E:
        return /^\d{8}$/.test(data);
      case BarcodeType.CODE128:
        return data.length > 0 && data.length <= 80;
      case BarcodeType.CODE39:
        return /^[A-Z0-9\-\.\ \$\/\+\%]+$/i.test(data);
      case BarcodeType.ITF:
      case BarcodeType.ITF14:
        return /^\d+$/.test(data) && data.length % 2 === 0;
      default:
        return data.length > 0;
    }
  }

  private detectBarcodeType(barcode: string): BarcodeType | null {
    if (/^\d{13}$/.test(barcode)) return BarcodeType.EAN13;
    if (/^\d{8}$/.test(barcode)) return BarcodeType.EAN8;
    if (/^\d{12}$/.test(barcode)) return BarcodeType.UPC_A;
    if (/^\d{14}$/.test(barcode)) return BarcodeType.ITF14;
    if (/^[A-Z0-9\-\.\ \$\/\+\%]+$/i.test(barcode)) return BarcodeType.CODE39;
    return BarcodeType.CODE128; // Default
  }

  private calculateChecksum(barcode: string, type: BarcodeType): string | null {
    // Implement checksum calculation for different barcode types
    // This is a simplified example for EAN13
    if (type === BarcodeType.EAN13 && barcode.length === 12) {
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3);
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      return checkDigit.toString();
    }
    return null;
  }

  private formatQRData(data: string, type: QRCodeType): string {
    switch (type) {
      case QRCodeType.URL:
        return data.startsWith('http') ? data : `https://${data}`;
      case QRCodeType.EMAIL:
        return `mailto:${data}`;
      case QRCodeType.PHONE:
        return `tel:${data}`;
      case QRCodeType.SMS:
        return `sms:${data}`;
      case QRCodeType.WIFI:
        // Assume data is JSON with ssid and password
        try {
          const wifi = JSON.parse(data);
          return `WIFI:T:WPA;S:${wifi.ssid};P:${wifi.password};;`;
        } catch {
          return data;
        }
      default:
        return data;
    }
  }

  private determineQRAction(type: QRCodeType): ScanAction {
    switch (type) {
      case QRCodeType.PRODUCT:
        return ScanAction.PRODUCT_LOOKUP;
      case QRCodeType.ORDER:
        return ScanAction.ORDER_LOOKUP;
      case QRCodeType.COUPON:
        return ScanAction.COUPON_APPLY;
      default:
        return ScanAction.CUSTOM;
    }
  }

  private generateBarcodeImagePlaceholder(data: string, type: BarcodeType): string {
    // In production, use a library like bwip-js to generate actual barcode images
    return `data:image/png;base64,placeholder_for_${type}_${data}`;
  }

  private generateQRCodeImagePlaceholder(data: string): string {
    // In production, use a library like qrcode to generate actual QR code images
    return `data:image/png;base64,placeholder_qr_${Buffer.from(data).toString('base64').substring(0, 20)}`;
  }

  private async lookupProductByBarcode(barcode: string, shopId?: string) {
    return this.searchByBarcode({ barcode, shopId });
  }

  private async lookupOrderByBarcode(barcode: string) {
    const orders = await this.db.query_builder()
      .from('orders')
      .select('*')
      .where('order_number', barcode)
      .get();

    if (orders.length === 0) {
      return { error: 'Order not found' };
    }

    return { order: orders[0] };
  }

  private async lookupOrderById(orderId: string) {
    const orders = await this.db.query_builder()
      .from('orders')
      .select('*')
      .where('id', orderId)
      .get();

    if (orders.length === 0) {
      return { error: 'Order not found' };
    }

    return { order: orders[0] };
  }

  private async handleInventoryScan(barcode: string, shopId?: string) {
    const result = await this.searchByBarcode({ barcode, shopId });
    if (!result.found) {
      return { error: 'Product not found' };
    }
    return {
      product: result.products[0],
      currentStock: result.products[0].stock,
      action: 'inventory_update',
    };
  }

  private async handlePOSScan(barcode: string, sessionId?: string) {
    const result = await this.searchByBarcode({ barcode });
    if (!result.found) {
      return { error: 'Product not found' };
    }
    return {
      product: result.products[0],
      action: 'add_to_cart',
      sessionId,
    };
  }

  private async handleCouponScan(code: string) {
    const coupons = await this.db.query_builder()
      .from('coupons')
      .select('*')
      .where('code', code)
      .get();

    if (coupons.length === 0) {
      return { error: 'Coupon not found' };
    }

    return { coupon: coupons[0] };
  }

  private async handleDeliveryVerification(barcode: string) {
    // Look up parcel or order by tracking number
    const parcels = await this.db.query_builder()
      .from('parcels')
      .select('*')
      .where('tracking_number', barcode)
      .get();

    if (parcels.length > 0) {
      return { parcel: parcels[0], type: 'parcel' };
    }

    const orders = await this.db.query_builder()
      .from('orders')
      .select('*')
      .where('order_number', barcode)
      .get();

    if (orders.length > 0) {
      return { order: orders[0], type: 'order' };
    }

    return { error: 'Delivery item not found' };
  }

  private async logScan(data: {
    barcode: string;
    type: string;
    action: ScanAction;
    userId: string;
    shopId?: string;
    result: any;
  }) {
    await this.db.query_builder()
      .from('barcode_scan_logs')
      .insert({
        barcode: data.barcode,
        type: data.type,
        action: data.action,
        user_id: data.userId,
        shop_id: data.shopId,
        result: JSON.stringify(data.result),
        created_at: new Date().toISOString(),
      })
      .execute();
  }

  private formatProduct(product: any): any {
    if (!product) return null;
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      price: product.price,
      stock: product.stock,
      shopId: product.shop_id,
      image: product.image,
    };
  }

  private formatLabelTemplate(template: any): any {
    if (!template) return null;
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      shopId: template.shop_id,
      labelSize: {
        width: template.label_width,
        height: template.label_height,
        unit: template.label_unit,
      },
      elements: JSON.parse(template.elements || '[]'),
      isDefault: template.is_default,
      createdAt: template.created_at,
    };
  }
}
