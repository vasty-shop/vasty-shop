import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export type PostStatus = 'draft' | 'published' | 'archived';
export type BlogType = 'latest' | 'popular' | 'featured' | 'all';

// Create Blog Post DTO
export class CreateBlogPostDto {
  @ApiProperty({ description: 'Blog post title' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Blog post content (HTML allowed)' })
  @IsString()
  @MinLength(10)
  content: string;

  @ApiPropertyOptional({ description: 'Short excerpt' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiPropertyOptional({ description: 'Category name' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Tags array', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Image URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({ description: 'Post status', enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: PostStatus;

  @ApiPropertyOptional({ description: 'Featured post' })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ description: 'SEO meta title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'SEO meta description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Author name override' })
  @IsOptional()
  @IsString()
  author?: string;
}

// Update Blog Post DTO
export class UpdateBlogPostDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: PostStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  author?: string;
}

// Blog Query DTO
export class BlogQueryDto {
  @ApiPropertyOptional({ enum: ['latest', 'popular', 'featured', 'all'] })
  @IsOptional()
  @IsEnum(['latest', 'popular', 'featured', 'all'])
  type?: BlogType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: PostStatus;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// Comment Query DTO
export class CommentQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// Create Comment DTO
export class CreateCommentDto {
  @ApiProperty({ description: 'Comment content' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({ description: 'Parent comment ID for replies' })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}

// Create Category DTO
export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

// Response DTOs (for documentation)
export class BlogPostResponseDto {
  id: string;
  userId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrls: string[];
  status: PostStatus;
  category: string;
  tags: string[];
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
  author: string;
  authorAvatar?: string;
  rating: number;
  ratingCount: number;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  userHasLiked?: boolean;
  userRating?: number;
}

export class PaginatedBlogPostsDto {
  data: BlogPostResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CommentResponseDto {
  id: string;
  postId: string;
  userId: string;
  parentCommentId: string | null;
  content: string;
  authorName: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  replies?: CommentResponseDto[];
}

export class PaginatedCommentsDto {
  data: CommentResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export class LikeResponseDto {
  liked: boolean;
  likesCount: number;
}

export class RatingResponseDto {
  rating: number;
  averageRating: number;
  ratingCount: number;
}

export class ImageUploadResponseDto {
  urls: string[];
  message: string;
}
