import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BundleType {
  FIXED = 'fixed',
  DYNAMIC = 'dynamic',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

export class BundleItemDto {
  @ApiProperty({ description: 'Product ID to include in the bundle' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity of this product in the bundle', default: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Whether this item is required in dynamic bundles', default: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}

export class CreateBundleDto {
  @ApiProperty({ description: 'Bundle name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Bundle description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: BundleType, description: 'fixed = all items included; dynamic = pick N of M' })
  @IsEnum(BundleType)
  bundleType: BundleType;

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ description: 'Discount value (percentage 0-100 or fixed amount)' })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ description: 'Minimum selections for dynamic bundles' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minSelections?: number;

  @ApiPropertyOptional({ description: 'Maximum selections for dynamic bundles' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxSelections?: number;

  @ApiProperty({ description: 'Component products', type: [BundleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  componentProducts: BundleItemDto[];
}

export class UpdateBundleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: BundleType })
  @IsOptional()
  @IsEnum(BundleType)
  bundleType?: BundleType;

  @ApiPropertyOptional({ enum: DiscountType })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  minSelections?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxSelections?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [BundleItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  componentProducts?: BundleItemDto[];
}

export class AddBundleToCartDto {
  @ApiPropertyOptional({
    description: 'Selected product IDs (required for dynamic bundles)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  selectedProductIds?: string[];
}
