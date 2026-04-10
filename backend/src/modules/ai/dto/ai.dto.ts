import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsEnum, IsUrl, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
}

export enum ImageSource {
  URL = 'url',
  BASE64 = 'base64',
  UPLOAD = 'upload',
}

// ============================================
// PRODUCT AUTO-FILL DTOs
// ============================================

export class AutoFillFromImageDto {
  @ApiProperty({ enum: ImageSource })
  @IsEnum(ImageSource)
  source: ImageSource;

  @ApiPropertyOptional({ description: 'Image URL (if source is url)' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Base64 encoded image (if source is base64)' })
  @IsOptional()
  @IsString()
  imageBase64?: string;

  @ApiPropertyOptional({ description: 'Uploaded file path (if source is upload)' })
  @IsOptional()
  @IsString()
  filePath?: string;

  @ApiPropertyOptional({ description: 'Category hint to improve suggestions' })
  @IsOptional()
  @IsString()
  categoryHint?: string;

  @ApiPropertyOptional({ description: 'Language for generated content' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Include SEO suggestions' })
  @IsOptional()
  @IsBoolean()
  includeSeo?: boolean;

  @ApiPropertyOptional({ description: 'Include pricing suggestions' })
  @IsOptional()
  @IsBoolean()
  includePricing?: boolean;
}

export class AutoFillFromTextDto {
  @ApiProperty({ description: 'Product name or brief description' })
  @IsString()
  productName: string;

  @ApiPropertyOptional({ description: 'Additional context or keywords' })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiPropertyOptional({ description: 'Category hint' })
  @IsOptional()
  @IsString()
  categoryHint?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeSeo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includePricing?: boolean;

  @ApiPropertyOptional({ description: 'Generate bullet points' })
  @IsOptional()
  @IsBoolean()
  includeFeatures?: boolean;

  @ApiPropertyOptional({ description: 'Number of description variants' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  variants?: number;
}

export class AutoFillFromBarcodeDto {
  @ApiProperty({ description: 'Barcode/UPC/EAN number' })
  @IsString()
  barcode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeSeo?: boolean;
}

// ============================================
// DESCRIPTION GENERATION DTOs
// ============================================

export class GenerateDescriptionDto {
  @ApiProperty()
  @IsString()
  productName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Key features as array' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ description: 'Target audience' })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiPropertyOptional({ enum: ['short', 'medium', 'long'] })
  @IsOptional()
  @IsString()
  length?: string;

  @ApiPropertyOptional({ enum: ['professional', 'casual', 'luxury', 'playful'] })
  @IsOptional()
  @IsString()
  tone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  variants?: number;
}

export class ImproveDescriptionDto {
  @ApiProperty()
  @IsString()
  currentDescription: string;

  @ApiPropertyOptional({ description: 'What to improve: clarity, seo, engagement, brevity' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  improvementGoals?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;
}

// ============================================
// SEO DTOs
// ============================================

export class GenerateSeoDto {
  @ApiProperty()
  @IsString()
  productName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;
}

export class GenerateTagsDto {
  @ApiProperty()
  @IsString()
  productName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(30)
  maxTags?: number;
}

// ============================================
// CATEGORY SUGGESTION DTOs
// ============================================

export class SuggestCategoryDto {
  @ApiProperty()
  @IsString()
  productName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Available categories to choose from' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableCategories?: string[];
}

// ============================================
// PRICING DTOs
// ============================================

export class SuggestPricingDto {
  @ApiProperty()
  @IsString()
  productName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ description: 'Target market region' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;
}

// ============================================
// IMAGE ANALYSIS DTOs
// ============================================

export class AnalyzeImageDto {
  @ApiProperty({ enum: ImageSource })
  @IsEnum(ImageSource)
  source: ImageSource;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageBase64?: string;

  @ApiPropertyOptional({ description: 'Extract colors from image' })
  @IsOptional()
  @IsBoolean()
  extractColors?: boolean;

  @ApiPropertyOptional({ description: 'Detect objects in image' })
  @IsOptional()
  @IsBoolean()
  detectObjects?: boolean;

  @ApiPropertyOptional({ description: 'Generate alt text for accessibility' })
  @IsOptional()
  @IsBoolean()
  generateAltText?: boolean;
}

// ============================================
// TRANSLATION DTOs
// ============================================

export class TranslateProductDto {
  @ApiProperty()
  @IsString()
  productName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiProperty({ description: 'Source language code' })
  @IsString()
  sourceLanguage: string;

  @ApiProperty({ description: 'Target language code' })
  @IsString()
  targetLanguage: string;

  @ApiPropertyOptional({ description: 'Also translate SEO metadata' })
  @IsOptional()
  @IsBoolean()
  includeSeo?: boolean;
}

// ============================================
// BULK OPERATIONS DTOs
// ============================================

export class BulkAutoFillDto {
  @ApiProperty({ description: 'Array of product IDs to auto-fill' })
  @IsArray()
  @IsString({ each: true })
  productIds: string[];

  @ApiPropertyOptional({ description: 'Fields to generate: description, seo, tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @ApiPropertyOptional({ description: 'Overwrite existing data' })
  @IsOptional()
  @IsBoolean()
  overwrite?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;
}

// ============================================
// CONFIGURATION DTOs
// ============================================

export class ConfigureAIDto {
  @ApiProperty({ enum: AIProvider })
  @IsEnum(AIProvider)
  provider: AIProvider;

  @ApiProperty({ description: 'API key for the provider' })
  @IsString()
  apiKey: string;

  @ApiPropertyOptional({ description: 'Model to use' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'Max tokens per request' })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(4000)
  maxTokens?: number;

  @ApiPropertyOptional({ description: 'Temperature (0-1)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number;
}

// ============================================
// RESPONSE DTOs
// ============================================

export class ProductAutoFillResponseDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  shortDescription: string | null;

  @ApiProperty()
  features: string[];

  @ApiProperty()
  category: string | null;

  @ApiProperty()
  tags: string[];

  @ApiProperty()
  seo: {
    metaTitle: string;
    metaDescription: string;
    slug: string;
    keywords: string[];
  } | null;

  @ApiProperty()
  pricing: {
    suggestedPrice: number;
    minPrice: number;
    maxPrice: number;
    currency: string;
  } | null;

  @ApiProperty()
  confidence: number;
}

export class DescriptionResponseDto {
  @ApiProperty()
  description: string;

  @ApiProperty()
  variants: string[];

  @ApiProperty()
  wordCount: number;
}

export class SeoResponseDto {
  @ApiProperty()
  metaTitle: string;

  @ApiProperty()
  metaDescription: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  keywords: string[];

  @ApiProperty()
  ogTitle: string;

  @ApiProperty()
  ogDescription: string;
}

export class TagsResponseDto {
  @ApiProperty()
  tags: string[];

  @ApiProperty()
  categories: string[];
}

export class ImageAnalysisResponseDto {
  @ApiProperty()
  labels: string[];

  @ApiProperty()
  colors: { hex: string; name: string; percentage: number }[];

  @ApiProperty()
  objects: { name: string; confidence: number }[];

  @ApiProperty()
  altText: string;

  @ApiProperty()
  suggestedCategory: string;
}

export class PricingSuggestionResponseDto {
  @ApiProperty()
  suggestedPrice: number;

  @ApiProperty()
  minPrice: number;

  @ApiProperty()
  maxPrice: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  confidence: string;

  @ApiProperty()
  reasoning: string;
}

export class AIUsageStatsResponseDto {
  @ApiProperty()
  totalRequests: number;

  @ApiProperty()
  totalTokensUsed: number;

  @ApiProperty()
  requestsByType: { type: string; count: number }[];

  @ApiProperty()
  costEstimate: number;

  @ApiProperty()
  lastUsed: string;
}
