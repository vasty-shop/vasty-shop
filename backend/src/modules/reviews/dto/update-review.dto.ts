import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, Min, Max, MinLength, IsOptional, IsArray } from 'class-validator';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'Rating from 1 to 5',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({
    description: 'Review title',
    example: 'Great product!',
    minLength: 5,
  })
  @IsString()
  @MinLength(5)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Review text',
    example: 'Updated review text...',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  @IsOptional()
  reviewText?: string;

  @ApiPropertyOptional({
    description: 'Pros of the product',
    example: ['Great quality', 'Fast delivery'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  pros?: string[];

  @ApiPropertyOptional({
    description: 'Cons of the product',
    example: ['Could be cheaper'],
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
