import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
  IsEnum,
  Min,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductImageDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({ example: 'Product image description' })
  @IsNotEmpty()
  @IsString()
  alt: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isPrimary: boolean;

  @ApiProperty({ example: 0 })
  @IsNumber()
  order: number;
}

export class VariantOptionDto {
  @ApiProperty({ example: 'Color' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Red' })
  @IsNotEmpty()
  @IsString()
  value: string;
}

export class ProductVariantDto {
  @ApiProperty({ example: 'Red - Large' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: [VariantOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantOptionDto)
  options: VariantOptionDto[];

  @ApiPropertyOptional({ example: 29.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'SKU-001' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  inventory?: number;

  @ApiPropertyOptional({ example: 'https://example.com/variant-image.jpg' })
  @IsOptional()
  @IsString()
  image?: string;
}

export class ProductInventoryDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  trackInventory: boolean;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  lowStockThreshold: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  allowBackorder: boolean;
}

export class ProductSEODto {
  @ApiPropertyOptional({ example: 'Best Product - Buy Now' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'This is the best product you can buy' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ example: ['product', 'sale', 'cheap'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];
}

export class CreateProductDto {
  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011', description: 'Shop ID (auto-filled from x-shop-id header)' })
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiProperty({ example: 'Premium Wireless Headphones' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Sony' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'High-quality wireless headphones with noise cancellation' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Cotton' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ example: ['Wireless', 'Noise Cancellation', 'Long Battery Life'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ example: { 'Weight': '250g', 'Battery': '30 hours' } })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, string>;

  @ApiPropertyOptional({ example: 'Premium headphones with amazing sound' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'SKU-12345' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: '1234567890123' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: 99.99 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 149.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 50.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerItem?: number;

  @ApiPropertyOptional({ type: [ProductImageDto], description: 'Product images (optional)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiPropertyOptional({ example: 'electronics', description: 'Category ID (optional)' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'headphones' })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional({ example: ['wireless', 'bluetooth', 'noise-cancelling'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [ProductVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @ApiPropertyOptional({ type: ProductInventoryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductInventoryDto)
  inventory?: ProductInventoryDto;

  @ApiPropertyOptional({ type: ProductSEODto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductSEODto)
  seo?: ProductSEODto;

  @ApiPropertyOptional({ example: 'draft', enum: ['active', 'draft', 'archived'] })
  @IsOptional()
  @IsEnum(['active', 'draft', 'archived'])
  status?: 'active' | 'draft' | 'archived';

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: ['campaign-id-1'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaignIds?: string[];

  @ApiPropertyOptional({ example: ['offer-id-1'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  offerIds?: string[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFlashSale?: boolean;

  @ApiPropertyOptional({ example: 79.99 })
  @IsOptional()
  @IsNumber()
  flashSalePrice?: number;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsString()
  flashSaleEndDate?: string;

  @ApiPropertyOptional({ example: '2024-12-01T00:00:00Z' })
  @IsOptional()
  @IsString()
  scheduledPublishDate?: string;

  @ApiPropertyOptional({ example: 'visible', enum: ['visible', 'hidden'] })
  @IsOptional()
  @IsEnum(['visible', 'hidden'])
  visibility?: 'visible' | 'hidden';

  @ApiPropertyOptional({ example: 'password123' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  lowStockThreshold?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  allowBackorders?: boolean;

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'draft'] })
  @IsOptional()
  @IsEnum(['active', 'draft'])
  stockStatus?: 'active' | 'draft';

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  taxable?: boolean;

  @ApiPropertyOptional({ example: 33.33 })
  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @ApiPropertyOptional({ example: 'SEO Title' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'SEO Description' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ example: 'product-slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: false, description: 'Whether product has size/color variants' })
  @IsOptional()
  @IsBoolean()
  hasVariants?: boolean;

  @ApiPropertyOptional({ example: ['S', 'M', 'L', 'XL'], description: 'Available sizes' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @ApiPropertyOptional({
    example: [{ name: 'Red', code: '#EF4444' }, { name: 'Blue', code: '#3B82F6' }],
    description: 'Available colors with hex codes'
  })
  @IsOptional()
  @IsArray()
  colors?: { name: string; code: string }[];

  @ApiPropertyOptional({
    example: ['Machine wash cold', 'Do not bleach', 'Tumble dry low'],
    description: 'Care instructions for the product'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  careInstructions?: string[];

  @ApiPropertyOptional({
    example: [{ size: 'S', chest: '34-36"', waist: '28-30"', hips: '36-38"', length: '27"' }],
    description: 'Size chart with measurements'
  })
  @IsOptional()
  @IsArray()
  sizeChart?: { size: string; chest?: string; waist?: string; hips?: string; length?: string }[];

  @ApiPropertyOptional({
    example: { freeShippingThreshold: 100, standardDays: '5-7', expressDays: '2-3', expressCost: 15.99, nextDayCost: 29.99 },
    description: 'Shipping information'
  })
  @IsOptional()
  shippingInfo?: {
    freeShippingThreshold?: number;
    standardDays?: string;
    expressDays?: string;
    expressCost?: number;
    nextDayCost?: number;
  };

  @ApiPropertyOptional({
    example: { returnDays: 30, conditions: ['Items must be unworn'], freeReturns: true, refundDays: '5-7' },
    description: 'Return policy'
  })
  @IsOptional()
  returnPolicy?: {
    returnDays?: number;
    conditions?: string[];
    freeReturns?: boolean;
    refundDays?: string;
  };
}
