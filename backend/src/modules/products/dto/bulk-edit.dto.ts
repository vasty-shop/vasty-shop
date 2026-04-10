import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  ValidateNested,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BulkAction {
  UPDATE_STATUS = 'update_status',
  UPDATE_PRICE = 'update_price',
  UPDATE_INVENTORY = 'update_inventory',
  UPDATE_CATEGORY = 'update_category',
  DELETE = 'delete',
}

export class BulkEditDto {
  @ApiProperty({
    description: 'Array of product IDs to edit',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one product ID is required' })
  @IsString({ each: true })
  productIds: string[];

  @ApiProperty({
    description: 'Action to perform on selected products',
    enum: BulkAction,
    example: BulkAction.UPDATE_STATUS,
  })
  @IsEnum(BulkAction, { message: 'Invalid action type' })
  action: BulkAction;

  @ApiPropertyOptional({
    description: 'New status for products (when action is update_status)',
    example: 'active',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Price adjustment type: "set" for absolute, "increase" or "decrease" for relative',
    example: 'set',
  })
  @IsOptional()
  @IsString()
  priceAdjustmentType?: 'set' | 'increase' | 'decrease' | 'percentage_increase' | 'percentage_decrease';

  @ApiPropertyOptional({
    description: 'Price value for adjustment',
    example: 29.99,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceValue?: number;

  @ApiPropertyOptional({
    description: 'Inventory adjustment type: "set" for absolute, "increase" or "decrease" for relative',
    example: 'set',
  })
  @IsOptional()
  @IsString()
  inventoryAdjustmentType?: 'set' | 'increase' | 'decrease';

  @ApiPropertyOptional({
    description: 'Inventory value for adjustment',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  inventoryValue?: number;

  @ApiPropertyOptional({
    description: 'Category ID to assign (when action is update_category)',
    example: 'category-uuid',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class BulkEditResponseDto {
  @ApiProperty({ description: 'Number of products successfully updated' })
  successCount: number;

  @ApiProperty({ description: 'Number of products that failed to update' })
  failedCount: number;

  @ApiProperty({ description: 'Array of product IDs that were successfully updated' })
  updatedProductIds: string[];

  @ApiProperty({ description: 'Array of errors for failed products' })
  errors: Array<{ productId: string; error: string }>;
}
