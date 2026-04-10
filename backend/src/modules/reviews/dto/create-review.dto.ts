import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsInt, IsString, Min, Max, MinLength, IsOptional, IsArray } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Product ID being reviewed',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({
    description: 'Order ID (for verified purchase)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  orderId?: string;

  @ApiProperty({
    description: 'Rating from 1 to 5',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Review title',
    example: 'Amazing product!',
    minLength: 5,
  })
  @IsString()
  @MinLength(5)
  title: string;

  @ApiProperty({
    description: 'Review text',
    example: 'This product exceeded my expectations. The quality is outstanding...',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  reviewText: string;

  @ApiPropertyOptional({
    description: 'Pros of the product',
    example: ['Great quality', 'Fast delivery', 'Good value'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  pros?: string[];

  @ApiPropertyOptional({
    description: 'Cons of the product',
    example: ['A bit expensive'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cons?: string[];

  @ApiPropertyOptional({
    description: 'Image URLs for review',
    example: ['https://example.com/image1.jpg'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({
    description: 'Would recommend this product',
    example: true,
  })
  @IsOptional()
  wouldRecommend?: boolean;
}
