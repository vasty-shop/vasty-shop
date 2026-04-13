import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

// ============================================
// WAREHOUSE DTOs
// ============================================

export class CreateWarehouseDto {
  @ApiProperty({ description: 'Warehouse name', example: 'Main Warehouse' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Warehouse address as JSON',
    example: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'US' },
  })
  @IsOptional()
  @IsObject()
  address?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Set as default warehouse', default: false })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @ApiPropertyOptional({ description: 'Whether the warehouse is active', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateWarehouseDto {
  @ApiPropertyOptional({ description: 'Warehouse name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Warehouse address as JSON' })
  @IsOptional()
  @IsObject()
  address?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Set as default warehouse' })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @ApiPropertyOptional({ description: 'Whether the warehouse is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// ============================================
// STOCK DTOs
// ============================================

export class SetStockDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ description: 'Stock quantity', example: 100 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: 'Low stock alert threshold', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  low_stock_threshold?: number;
}

export class TransferStockDto {
  @ApiProperty({ description: 'Source warehouse ID' })
  @IsUUID()
  from_warehouse_id: string;

  @ApiProperty({ description: 'Destination warehouse ID' })
  @IsUUID()
  to_warehouse_id: string;

  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ description: 'Quantity to transfer', example: 10 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ReserveStockDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ description: 'Quantity to reserve', example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Preferred warehouse ID to reserve from' })
  @IsOptional()
  @IsUUID()
  preferred_warehouse_id?: string;
}
