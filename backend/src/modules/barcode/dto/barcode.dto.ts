import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray } from 'class-validator';

// ============================================
// ENUMS
// ============================================

export enum BarcodeType {
  EAN13 = 'EAN13',
  EAN8 = 'EAN8',
  UPC_A = 'UPC-A',
  UPC_E = 'UPC-E',
  CODE128 = 'CODE128',
  CODE39 = 'CODE39',
  CODE93 = 'CODE93',
  ITF = 'ITF',
  ITF14 = 'ITF14',
  CODABAR = 'CODABAR',
  MSI = 'MSI',
  PHARMACODE = 'PHARMACODE',
  QR_CODE = 'QR_CODE',
  DATA_MATRIX = 'DATA_MATRIX',
  PDF417 = 'PDF417',
  AZTEC = 'AZTEC',
}

export enum QRCodeType {
  URL = 'url',
  TEXT = 'text',
  PRODUCT = 'product',
  ORDER = 'order',
  PAYMENT = 'payment',
  COUPON = 'coupon',
  VCARD = 'vcard',
  WIFI = 'wifi',
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  GEO = 'geo',
  CUSTOM = 'custom',
}

export enum BarcodeFormat {
  PNG = 'png',
  SVG = 'svg',
  JPEG = 'jpeg',
  PDF = 'pdf',
}

export enum ScanAction {
  PRODUCT_LOOKUP = 'product_lookup',
  ORDER_LOOKUP = 'order_lookup',
  INVENTORY_UPDATE = 'inventory_update',
  POS_ADD_ITEM = 'pos_add_item',
  COUPON_APPLY = 'coupon_apply',
  DELIVERY_VERIFY = 'delivery_verify',
  CUSTOM = 'custom',
}

// ============================================
// BARCODE GENERATION DTOs
// ============================================

export class GenerateBarcodeDto {
  @IsString()
  data: string;

  @IsEnum(BarcodeType)
  type: BarcodeType;

  @IsOptional()
  @IsEnum(BarcodeFormat)
  format?: BarcodeFormat;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  lineColor?: string;

  @IsOptional()
  @IsBoolean()
  includeText?: boolean;

  @IsOptional()
  @IsNumber()
  fontSize?: number;

  @IsOptional()
  @IsNumber()
  margin?: number;
}

export class GenerateQRCodeDto {
  @IsString()
  data: string;

  @IsEnum(QRCodeType)
  type: QRCodeType;

  @IsOptional()
  @IsEnum(BarcodeFormat)
  format?: BarcodeFormat;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsString()
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  foregroundColor?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsNumber()
  logoSize?: number;

  @IsOptional()
  @IsNumber()
  margin?: number;
}

export class GenerateProductBarcodeDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsEnum(BarcodeType)
  type?: BarcodeType;

  @IsOptional()
  @IsEnum(BarcodeFormat)
  format?: BarcodeFormat;

  @IsOptional()
  @IsBoolean()
  includePrice?: boolean;

  @IsOptional()
  @IsBoolean()
  includeName?: boolean;

  @IsOptional()
  @IsBoolean()
  includeSKU?: boolean;
}

export class GenerateOrderQRDto {
  @IsString()
  orderId: string;

  @IsOptional()
  @IsEnum(BarcodeFormat)
  format?: BarcodeFormat;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsString()
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export class BulkGenerateBarcodeDto {
  @IsArray()
  items: GenerateBarcodeDto[];

  @IsOptional()
  @IsBoolean()
  asZip?: boolean;
}

// ============================================
// BARCODE SCANNING DTOs
// ============================================

export class ScanBarcodeDto {
  @IsString()
  barcode: string;

  @IsOptional()
  @IsEnum(BarcodeType)
  type?: BarcodeType;

  @IsOptional()
  @IsEnum(ScanAction)
  action?: ScanAction;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string; // For POS session
}

export class ScanQRCodeDto {
  @IsString()
  data: string;

  @IsOptional()
  @IsEnum(QRCodeType)
  expectedType?: QRCodeType;

  @IsOptional()
  @IsEnum(ScanAction)
  action?: ScanAction;

  @IsOptional()
  @IsString()
  shopId?: string;
}

export class BatchScanDto {
  @IsArray()
  barcodes: string[];

  @IsOptional()
  @IsEnum(ScanAction)
  action?: ScanAction;

  @IsOptional()
  @IsString()
  shopId?: string;
}

// ============================================
// PRODUCT BARCODE DTOs
// ============================================

export class AssignBarcodeDto {
  @IsString()
  productId: string;

  @IsString()
  barcode: string;

  @IsOptional()
  @IsEnum(BarcodeType)
  type?: BarcodeType;

  @IsOptional()
  @IsString()
  variantId?: string;
}

export class UpdateProductBarcodeDto {
  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsEnum(BarcodeType)
  type?: BarcodeType;
}

export class SearchByBarcodeDto {
  @IsString()
  barcode: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsBoolean()
  includeVariants?: boolean;
}

// ============================================
// LABEL PRINTING DTOs
// ============================================

export class LabelSizeDto {
  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsOptional()
  @IsString()
  unit?: 'mm' | 'inch';
}

export class LabelElementDto {
  @IsString()
  type: string; // barcode, text, image, qrcode, line, rectangle

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  content?: string; // For text: actual text or variable like {{product.name}}

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsNumber()
  fontSize?: number;

  @IsOptional()
  @IsString()
  fontWeight?: string;

  @IsOptional()
  @IsString()
  textAlign?: string;

  @IsOptional()
  @IsEnum(BarcodeType)
  barcodeType?: BarcodeType;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class PrintLabelDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  labelTemplate?: string;

  @IsOptional()
  @IsString()
  printerType?: 'thermal' | 'laser' | 'inkjet';

  @IsOptional()
  labelSize?: LabelSizeDto;

  @IsOptional()
  @IsBoolean()
  includePrice?: boolean;

  @IsOptional()
  @IsBoolean()
  includeName?: boolean;

  @IsOptional()
  @IsBoolean()
  includeSKU?: boolean;

  @IsOptional()
  @IsBoolean()
  includeShopLogo?: boolean;
}

export class BulkPrintLabelsDto {
  @IsArray()
  productIds: string[];

  @IsOptional()
  @IsNumber()
  quantityEach?: number;

  @IsOptional()
  @IsString()
  labelTemplate?: string;

  @IsOptional()
  labelSize?: LabelSizeDto;
}

export class CreateLabelTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  shopId: string;

  labelSize: LabelSizeDto;

  @IsArray()
  elements: LabelElementDto[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateLabelTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  labelSize?: LabelSizeDto;

  @IsOptional()
  @IsArray()
  elements?: LabelElementDto[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

// ============================================
// INVENTORY SCANNING DTOs
// ============================================

export class InventoryScanDto {
  @IsString()
  barcode: string;

  @IsString()
  shopId: string;

  @IsString()
  action: 'count' | 'add' | 'remove' | 'adjust';

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class StartInventorySessionDto {
  @IsString()
  shopId: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsArray()
  categoryIds?: string[];
}

export class InventoryScanEntryDto {
  @IsString()
  sessionId: string;

  @IsString()
  barcode: string;

  @IsOptional()
  @IsNumber()
  scannedQuantity?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CompleteInventorySessionDto {
  @IsString()
  sessionId: string;

  @IsOptional()
  @IsBoolean()
  updateStock?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

// ============================================
// VERIFICATION DTOs
// ============================================

export class VerifyBarcodeDto {
  @IsString()
  barcode: string;

  @IsEnum(BarcodeType)
  type: BarcodeType;
}

export class ValidateBarcodeFormatDto {
  @IsString()
  barcode: string;

  @IsOptional()
  @IsEnum(BarcodeType)
  expectedType?: BarcodeType;
}

// ============================================
// HISTORY DTOs
// ============================================

export class ScanHistoryFilterDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsEnum(ScanAction)
  action?: ScanAction;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
