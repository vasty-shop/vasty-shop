import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';

export class ValidateCouponDto {
  @ApiProperty({ example: 'SUMMER20', description: 'Coupon code to validate' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 100, description: 'Cart subtotal' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  cartSubtotal: number;

  @ApiPropertyOptional({
    example: ['prod_123', 'prod_456'],
    description: 'Product IDs in cart'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @ApiPropertyOptional({
    example: ['cat_123'],
    description: 'Category IDs of products in cart'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011', description: 'User ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: 3, description: 'Number of items in cart' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  itemCount?: number;
}

export class ApplyCouponDto extends ValidateCouponDto {
  @ApiProperty({ example: 'cart_123', description: 'Cart ID to apply coupon to' })
  @IsNotEmpty()
  @IsString()
  cartId: string;
}
