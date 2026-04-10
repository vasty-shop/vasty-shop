import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, Max, IsEnum } from 'class-validator';
import { ReviewStatus } from './moderate-review.dto';

export class QueryReviewsDto {
  @ApiPropertyOptional({
    description: 'Filter by rating',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({
    description: 'Filter by review status',
    enum: ReviewStatus,
    example: ReviewStatus.APPROVED,
  })
  @IsEnum(ReviewStatus)
  @IsOptional()
  status?: ReviewStatus;

  @ApiPropertyOptional({
    description: 'Filter verified purchases only',
    example: true,
  })
  @IsOptional()
  verifiedOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Filter reviews with images only',
    example: true,
  })
  @IsOptional()
  withImagesOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Sort by',
    enum: ['recent', 'helpful', 'rating_high', 'rating_low'],
    default: 'recent',
  })
  @IsOptional()
  sortBy?: 'recent' | 'helpful' | 'rating_high' | 'rating_low';

  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Page limit',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Page offset',
    minimum: 0,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;
}
