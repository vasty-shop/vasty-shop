import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class AddToWishlistDto {
  @ApiProperty({
    description: 'Product ID to add to wishlist',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({
    description: 'Specific wishlist ID (if user has multiple wishlists)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  wishlistId?: string;

  @ApiPropertyOptional({
    description: 'Optional note about the product',
    example: 'For birthday gift',
  })
  @IsString()
  @IsOptional()
  note?: string;
}
